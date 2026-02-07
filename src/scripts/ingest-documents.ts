import { NestFactory } from '@nestjs/core';
import { IngestModule } from './ingest.module';
import { IngestionService } from '../ingestion/ingestion.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(IngestModule);
  const ingestionService = app.get(IngestionService);

  await ingestionService.ingestAll();
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});
