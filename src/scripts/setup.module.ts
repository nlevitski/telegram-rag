import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestionModule } from '../ingestion/ingestion.module';
import { LlmModule } from '../llm/llm.module';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    IngestionModule,
    LlmModule,
    QdrantModule,
  ],
})
export class SetupModule {}
