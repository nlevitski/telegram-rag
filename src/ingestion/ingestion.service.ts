import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from '../qdrant/qdrant.service';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface JsonlChunk {
  content: string;
  metadata: Record<string, any>;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly dataDir = path.join(
    process.cwd(),
    'data/documents/output/md',
  );

  constructor(private readonly qdrantService: QdrantService) { }

  async ingestAll() {
    this.logger.log('Starting full ingestion...');

    // 1. Clear existing collection
    this.logger.log('Clearing old data...');
    await this.qdrantService.clearCollection();

    // 2. Read files
    const files = fs
      .readdirSync(this.dataDir)
      .filter((f) => f.endsWith('.jsonl'));

    for (const file of files) {
      this.logger.log(`Processing file: ${file}`);
      const filePath = path.join(this.dataDir, file);
      await this.processFile(filePath);
    }

    this.logger.log('Ingestion completed successfully.');
  }

  private async processFile(filePath: string) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const chunks: any[] = [];

    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        const json: JsonlChunk = JSON.parse(line);
        // Map to format expected by QdrantService
        // QdrantService expect DocumentChunk { content: string, metadata: ... }
        // Our jsonl IS that format basically.
        chunks.push(json);
      } catch (e) {
        this.logger.warn(
          `Failed to parse line in ${path.basename(filePath)}: ${e.message}`,
        );
      }
    }

    if (chunks.length > 0) {
      await this.qdrantService.indexChunks(chunks);
    }
  }
}
