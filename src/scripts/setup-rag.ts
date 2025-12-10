import { NestFactory } from '@nestjs/core';
import { SetupModule } from './setup.module';
import { IngestionService } from '../ingestion/ingestion.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { LlmService } from '../llm/llm.service';
import { HumanMessage } from '@langchain/core/messages';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SetupModule);

  const ingestionService = app.get(IngestionService);
  const qdrantService = app.get(QdrantService);
  const llmService = app.get(LlmService);

  console.log('--- 1. Checking Qdrant Connection ---');
  const connected = await qdrantService.checkConnection();
  if (!connected) {
    console.error('Failed to connect to Qdrant. Exiting.');
    process.exit(1);
  }
  console.log('Qdrant Connected.');

  console.log('--- 2. Ingesting Data (this might take a while) ---');
  await ingestionService.ingestAll();

  console.log('--- 3. Verifying Search ---');
  const searchResult = await qdrantService.search(
    'Qubic incubation program',
    3,
  );
  console.log('Search Results:', JSON.stringify(searchResult, null, 2));

  if (searchResult.length === 0) {
    console.error('No results found! Ingestion might have failed.');
  }

  console.log('--- 4. Verifying LLM ---');
  try {
    const answer = await llmService.chat([
      new HumanMessage('Say "Hello, World!" if you can hear me.'),
    ]);
    console.log('LLM Response:', answer);
  } catch (e) {
    console.error('LLM Check Failed:', e.message);
  }

  await app.close();
}

bootstrap();
