// src/documents/document-processor.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { ChunkingService, DocumentChunk } from './chunking.service';

@Injectable()
export class DocumentProcessorService {
  constructor(private chunkingService: ChunkingService) {}

  async processFile(filePath: string): Promise<DocumentChunk[]> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'txt':
        return this.processTxt(filePath);
      case 'pdf':
        return this.processPdf(filePath);
      case 'docx':
        return this.processDocx(filePath);
      case 'md':
        return this.processMarkdown(filePath);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  private async processTxt(filePath: string): Promise<DocumentChunk[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.chunkingService.chunkByParagraphs(content, 1000, {
      sourceFile: filePath,
      fileType: 'txt',
    });
  }

  private async processPdf(filePath: string): Promise<DocumentChunk[]> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return this.chunkingService.chunkByParagraphs(data.text, 1000, {
      sourceFile: filePath,
      fileType: 'pdf',
      totalPages: data.numpages,
    });
  }

  private async processDocx(filePath: string): Promise<DocumentChunk[]> {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });

    return this.chunkingService.chunkByParagraphs(result.value, 1000, {
      sourceFile: filePath,
      fileType: 'docx',
    });
  }

  private async processMarkdown(filePath: string): Promise<DocumentChunk[]> {
    const content = await fs.readFile(filePath, 'utf-8');

    // Для markdown можно делать chunking с учетом заголовков
    return this.chunkingService.chunkByParagraphs(content, 1000, {
      sourceFile: filePath,
      fileType: 'markdown',
    });
  }

  // Обработка директории с документами
  async processDirectory(dirPath: string): Promise<DocumentChunk[]> {
    const files = await fs.readdir(dirPath);
    const allChunks: DocumentChunk[] = [];

    for (const file of files) {
      const filePath = `${dirPath}/${file}`;
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        try {
          const chunks = await this.processFile(filePath);
          allChunks.push(...chunks);
          console.log(`Processed: ${file} - ${chunks.length} chunks`);
        } catch (error) {
          console.error(`Error processing ${file}:`, error.message);
        }
      }
    }

    return allChunks;
  }
}
