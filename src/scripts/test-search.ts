import { NestFactory } from '@nestjs/core';
import { SetupModule } from './setup.module';
import { QdrantService } from '../qdrant/qdrant.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SetupModule);
    const qdrantService = app.get(QdrantService);

    const query = "where can i buy qubic $QUBIC";
    const locale = "en";

    console.log(`Searching for: "${query}" in locale: "${locale}"`);

    const results = await qdrantService.search(
        query,
        3, // Limit to 3 to find relevant chunk
        0.01,
        {
            key: 'language',
            match: { value: locale },
        }
    );

    if (results.length > 0) {
        for (const res of results) {
            console.log(`\n--- Result (Score: ${res.score}) ---`);
            console.log(`File: ${res.payload?.filename}`);
            console.log(`Chunk Index: ${res.payload?.chunk_index}`);
            console.log(`Content:\n${res.payload?.content}`);

            const filename = res.payload?.filename as string;
            const chunkIndex = res.payload?.chunk_index as number;

            if (filename && typeof chunkIndex === 'number') {
                console.log(`\n--- Fetching Next Chunk (${chunkIndex + 1}) ---`);
                const nextChunk = await qdrantService.getChunk(filename, chunkIndex + 1);
                if (nextChunk) {
                    console.log(`Next Chunk Content:\n${nextChunk.payload?.content}`);
                } else {
                    console.log("No next chunk found.");
                }
            }
        }
    } else {
        console.log("No results found.");
    }

    await app.close();
}

bootstrap();
