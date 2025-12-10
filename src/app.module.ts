import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { DocumentLoaderModule } from './document-loader/document-loader.module';
import { DatabaseModule } from './db/db.module';
import { LlmModule } from './llm/llm.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { EmbeddingModule } from './embeddings/embeddings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRoot(),
    TelegramModule.forRoot(),
    DocumentLoaderModule,
    LlmModule,
    IngestionModule,
    QdrantModule,
    EmbeddingModule,
  ],
})
export class AppModule {}
