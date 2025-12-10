// src/qdrant/qdrant.module.ts
import { Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { EmbeddingModule } from '../embeddings/embeddings.module';

@Module({
  imports: [EmbeddingModule],
  providers: [QdrantService],
  exports: [QdrantService],
})
export class QdrantModule {}
