import { QdrantClient } from '@qdrant/js-client-rest';
// src/qdrant/qdrant.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';

import { DocumentChunk } from '../documents/chunking.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly collectionName = 'documents';

  constructor(private embeddingsService: EmbeddingsService) {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
    });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    const collections = await this.client.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === this.collectionName,
    );

    if (!exists) {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 384,
          distance: 'Cosine',
        },
      });
    }
  }

  // Загрузка чанков батчами
  async indexChunks(chunks: DocumentChunk[], batchSize: number = 10) {
    console.log(`Indexing ${chunks.length} chunks...`);

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      // Генерируем embeddings для батча
      const embeddings = await this.embeddingsService.generateEmbeddings(
        batch.map((c) => c.content),
      );

      // Подготавливаем points для Qdrant
      const points = batch.map((chunk, idx) => ({
        id: Date.now() + i + idx, // уникальный ID
        vector: embeddings[idx],
        payload: {
          content: chunk.content,
          ...chunk.metadata,
        },
      }));

      await this.client.upsert(this.collectionName, {
        points,
      });

      console.log(
        `Indexed batch ${i / batchSize + 1} of ${Math.ceil(chunks.length / batchSize)}`,
      );
    }

    console.log('✅ Indexing complete!');
  }

  // Поиск с фильтрацией
  async search(query: string, limit: number = 5, filter?: Record<string, any>) {
    const queryVector = await this.embeddingsService.generateEmbedding(query);

    const results = await this.client.search(this.collectionName, {
      vector: queryVector,
      limit,
      with_payload: true,
      filter: filter ? { must: [filter] } : undefined,
    });

    return results;
  }

  // Очистка коллекции
  async clearCollection() {
    await this.client.deleteCollection(this.collectionName);
    await this.ensureCollection();
  }
}
