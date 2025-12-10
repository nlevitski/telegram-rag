import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [QdrantModule],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule { }
