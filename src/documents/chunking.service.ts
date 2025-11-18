// src/documents/chunking.service.ts
import { Injectable } from '@nestjs/common';

export interface ChunkOptions {
  chunkSize?: number; // размер чанка в символах
  chunkOverlap?: number; // пересечение между чанками
  separators?: string[]; // разделители для split
}

export interface DocumentChunk {
  content: string;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    sourceFile?: string;
    startChar?: number;
    endChar?: number;
    [key: string]: any;
  };
}

@Injectable()
export class ChunkingService {
  // Рекурсивный chunking с умными разделителями
  chunkText(
    text: string,
    options: ChunkOptions = {},
    metadata: Record<string, any> = {},
  ): DocumentChunk[] {
    const {
      chunkSize = 1000, // оптимально для MiniLM
      chunkOverlap = 200,
      separators = ['\n\n', '\n', '. ', ' ', ''],
    } = options;

    const chunks: DocumentChunk[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = startIndex + chunkSize;

      // Если это последний чанк
      if (endIndex >= text.length) {
        endIndex = text.length;
      } else {
        // Пытаемся найти хороший разделитель
        let bestSplit = endIndex;

        for (const separator of separators) {
          const lastSeparator = text.lastIndexOf(separator, endIndex);

          if (lastSeparator > startIndex && lastSeparator < endIndex) {
            bestSplit = lastSeparator + separator.length;
            break;
          }
        }

        endIndex = bestSplit;
      }

      const content = text.slice(startIndex, endIndex).trim();

      if (content.length > 0) {
        chunks.push({
          content,
          metadata: {
            ...metadata,
            chunkIndex: chunks.length,
            totalChunks: 0, // обновим позже
            startChar: startIndex,
            endChar: endIndex,
          },
        });
      }

      startIndex = endIndex - chunkOverlap;
    }

    // Обновляем totalChunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  // Semantic chunking - разбивка по параграфам/секциям
  chunkByParagraphs(
    text: string,
    maxChunkSize: number = 1000,
    metadata: Record<string, any> = {},
  ): DocumentChunk[] {
    const paragraphs = text.split(/\n\n+/);
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();

      if (!trimmedParagraph) continue;

      // Если параграф сам по себе большой - разбиваем его
      if (trimmedParagraph.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              ...metadata,
              chunkIndex: chunks.length,
              totalChunks: 0,
            },
          });
          currentChunk = '';
        }

        // Рекурсивно разбиваем большой параграф
        const subChunks = this.chunkText(
          trimmedParagraph,
          { chunkSize: maxChunkSize, chunkOverlap: 100 },
          metadata,
        );
        chunks.push(...subChunks);
        continue;
      }

      // Если добавление параграфа превысит размер - создаем новый чанк
      if (currentChunk.length + trimmedParagraph.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              ...metadata,
              chunkIndex: chunks.length,
              totalChunks: 0,
            },
          });
        }
        currentChunk = trimmedParagraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      }
    }

    // Добавляем последний чанк
    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          ...metadata,
          chunkIndex: chunks.length,
          totalChunks: 0,
        },
      });
    }

    // Обновляем totalChunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  // Chunking с сохранением контекста (добавляет заголовки к каждому чанку)
  chunkWithContext(
    text: string,
    headers: string[] = [],
    options: ChunkOptions = {},
  ): DocumentChunk[] {
    const contextPrefix =
      headers.length > 0 ? headers.join(' > ') + '\n\n' : '';

    const chunks = this.chunkText(text, options);

    return chunks.map((chunk) => ({
      ...chunk,
      content: contextPrefix + chunk.content,
      metadata: {
        ...chunk.metadata,
        headers,
      },
    }));
  }
}
