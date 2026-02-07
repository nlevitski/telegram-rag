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
  private readonly dataDirs = [
    path.join(process.cwd(), 'data/documents/output/md'),
    path.join(process.cwd(), 'data/documents/output/pdf'),
  ];

  constructor(private readonly qdrantService: QdrantService) {}

  async ingestAll(options: { clear?: boolean } = {}) {
    this.logger.log('Starting full ingestion...');

    // 1. Clear existing collection
    const shouldClear = options.clear ?? true;
    if (shouldClear) {
      this.logger.log('Clearing old data...');
      await this.qdrantService.clearCollection();
    }

    // 2. Read files
    const files = await this.collectJsonlFiles();
    if (files.length === 0) {
      this.logger.warn('No JSONL files found for ingestion.');
      return;
    }

    for (const file of files) {
      this.logger.log(`Processing file: ${file}`);
      const chunksCount = await this.processFile(file);
      this.logger.log(`Loaded ${chunksCount} chunks from ${file}`);
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

    return chunks.length;
  }

  private async collectJsonlFiles(): Promise<string[]> {
    const files: string[] = [];

    for (const dir of this.dataDirs) {
      const dirFiles = await this.walkDir(dir);
      files.push(...dirFiles);
    }

    return files.sort();
  }

  private async walkDir(dirPath: string): Promise<string[]> {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const results: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...(await this.walkDir(fullPath)));
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.jsonl')) {
        results.push(fullPath);
      }
    }

    return results;
  }
}
