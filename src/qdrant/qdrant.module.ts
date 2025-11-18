// src/qdrant/qdrant.module.ts
import { Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { EmbeddingsService } from 'src/embeddings/embeddings.service';

@Module({
  providers: [QdrantService, EmbeddingsService],
  exports: [QdrantService],
})
export class QdrantModule {}
