import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PDFParse } from 'pdf-parse';

type JsonlChunk = {
  content: string;
  metadata: Record<string, any>;
};

const MARKDOWN_CHUNK_SIZE = 400;
const MARKDOWN_CHUNK_OVERLAP = 50;
const MARKDOWN_MIN_CHARS_TO_SPLIT = 400;

const PDF_CHUNK_SIZE = 2000;
const PDF_CHUNK_OVERLAP = 200;

const TEXT_SEPARATORS = ['\n\n', '\n', ' ', ''];

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'documents', 'output');
const RAW_DIR = path.join(process.cwd(), 'data', 'documents', 'raw');
const RAW_MD_DIR = path.join(RAW_DIR, 'md');
const RAW_PDF_DIR = path.join(RAW_DIR, 'pdf');
const OUTPUT_MD_DIR = path.join(OUTPUT_DIR, 'md');
const OUTPUT_PDF_DIR = path.join(OUTPUT_DIR, 'pdf');

const toPosixPath = (value: string) => value.split(path.sep).join('/');

const replaceExtension = (filePath: string, newExt: string) =>
  filePath.replace(/\.[^.]+$/, newExt);

const normalizeText = (text: string): string => {
  let normalized = text;

  if (normalized.startsWith('\ufeff')) {
    normalized = normalized.slice(1);
  }

  normalized = normalized.replace(/\r\n?/g, '\n');
  normalized = normalized.replace(/[ \t]+/g, ' ');
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  normalized = normalized.replace(/([.!?,;:])\1+/g, '$1');
  normalized = normalized.trim();

  return normalized;
};

const md5Hash = (text: string) =>
  crypto.createHash('md5').update(text, 'utf8').digest('hex');

const chunkText = (
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  separators: string[] = TEXT_SEPARATORS,
): string[] => {
  if (!text) return [];

  const safeChunkSize = Math.max(1, chunkSize);
  const safeOverlap = Math.max(0, Math.min(chunkOverlap, safeChunkSize - 1));

  const chunks: string[] = [];
  let startIndex = 0;
  let iterations = 0;
  const maxIterations = Math.ceil(text.length / Math.max(1, safeChunkSize)) + 5;

  while (startIndex < text.length) {
    iterations += 1;
    if (iterations > maxIterations) {
      break;
    }

    let endIndex = Math.min(startIndex + safeChunkSize, text.length);

    if (endIndex < text.length) {
      let bestSplit = endIndex;

      for (const separator of separators) {
        if (!separator) continue;
        const lastSeparator = text.lastIndexOf(separator, endIndex);
        if (lastSeparator > startIndex && lastSeparator < endIndex) {
          bestSplit = lastSeparator + separator.length;
          break;
        }
      }

      endIndex = bestSplit;
    }

    if (endIndex <= startIndex) {
      endIndex = Math.min(startIndex + safeChunkSize, text.length);
      if (endIndex <= startIndex) {
        break;
      }
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (endIndex >= text.length) {
      break;
    }

    const nextStart = endIndex - safeOverlap;
    startIndex = nextStart > startIndex ? nextStart : endIndex;
  }

  return chunks;
};

const listFiles = (rootDir: string, extensions: string[]): string[] => {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const results: string[] = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(fullPath, extensions));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const lowerName = entry.name.toLowerCase();
    if (extensions.some((ext) => lowerName.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results.sort();
};

const writeJsonl = (filePath: string, rows: JsonlChunk[]) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const content = rows.map((row) => JSON.stringify(row)).join('\n');
  fs.writeFileSync(filePath, content ? `${content}\n` : '', 'utf8');
};

export class DocumentParser {
  async parseAll() {
    const markdownSummary = await this.parseMarkdownDirectory();
    const pdfSummary = await this.parsePdfDirectory();

    return {
      markdown: markdownSummary,
      pdf: pdfSummary,
    };
  }

  async parseMarkdownDirectory() {
    const mdFiles = listFiles(RAW_MD_DIR, ['.md', '.markdown']);
    if (mdFiles.length === 0) {
      console.log(`No markdown files found in ${RAW_MD_DIR}`);
      return { files: 0, chunks: 0 };
    }

    let totalChunks = 0;
    console.log(`Found ${mdFiles.length} markdown files`);

    for (const filePath of mdFiles) {
      try {
        console.log(`Parsing ${filePath}`);
        const chunks = this.parseMarkdownFile(filePath);
        totalChunks += chunks.length;

        const relativePath = path.relative(RAW_MD_DIR, filePath);
        const outputPath = path.join(
          OUTPUT_MD_DIR,
          replaceExtension(relativePath, '.jsonl'),
        );
        writeJsonl(outputPath, chunks);
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
      }
    }

    console.log(`Markdown parsing completed.`);
    return { files: mdFiles.length, chunks: totalChunks };
  }

  async parsePdfDirectory() {
    const pdfFiles = listFiles(RAW_PDF_DIR, ['.pdf']);
    if (pdfFiles.length === 0) {
      console.log(`No PDF files found in ${RAW_PDF_DIR}`);
      return { files: 0, chunks: 0 };
    }

    let totalChunks = 0;
    console.log(`Found ${pdfFiles.length} PDF files`);

    for (const filePath of pdfFiles) {
      try {
        console.log(`Parsing ${filePath}`);
        const chunks = await this.parsePdfFile(filePath);
        totalChunks += chunks.length;

        const relativePath = path.relative(RAW_PDF_DIR, filePath);
        const outputPath = path.join(
          OUTPUT_PDF_DIR,
          replaceExtension(relativePath, '.jsonl'),
        );
        writeJsonl(outputPath, chunks);
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
      }
    }

    console.log(`PDF parsing completed.`);
    return { files: pdfFiles.length, chunks: totalChunks };
  }

  private parseMarkdownFile(filePath: string): JsonlChunk[] {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const normalizedContent = normalizeText(rawContent);

    if (!normalizedContent) {
      console.warn(`Skipping empty markdown file: ${filePath}`);
      return [];
    }

    const source = toPosixPath(path.relative(RAW_DIR, filePath));
    const filename = path.basename(filePath);
    const contentHash = md5Hash(normalizedContent);
    const totalChars = normalizedContent.length;

    const relativeFromMd = path.relative(RAW_MD_DIR, filePath);
    const category = relativeFromMd.includes(path.sep)
      ? relativeFromMd.split(path.sep)[0]
      : '';

    const normalizedFileName = filename.toLowerCase();
    const language =
      normalizedFileName === 'ru.md'
        ? 'ru'
        : normalizedFileName === 'en.md'
          ? 'en'
          : 'en';

    const baseMetadata = {
      source,
      filename,
      file_type: 'markdown',
      content_hash: contentHash,
      total_chars: totalChars,
      language,
      category,
    };

    if (normalizedContent.length < MARKDOWN_MIN_CHARS_TO_SPLIT) {
      return [
        {
          content: normalizedContent,
          metadata: {
            ...baseMetadata,
            chunk_index: 0,
            chunk_count: 1,
            chunk_size: normalizedContent.length,
            is_chunked: false,
          },
        },
      ];
    }

    const chunks = chunkText(
      normalizedContent,
      MARKDOWN_CHUNK_SIZE,
      MARKDOWN_CHUNK_OVERLAP,
    );

    return chunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        ...baseMetadata,
        chunk_index: index,
        chunk_count: chunks.length,
        chunk_size: chunk.length,
        is_chunked: true,
      },
    }));
  }

  private async parsePdfFile(filePath: string): Promise<JsonlChunk[]> {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const textData = await parser.getText({ pageJoiner: '' });

    const pagesInfo: Array<{
      page_number: number;
      char_count: number;
      line_count: number;
    }> = [];
    const fullTextParts: string[] = [];

    for (const page of textData.pages) {
      const pageText = page.text || '';
      if (!pageText.trim()) {
        continue;
      }
      pagesInfo.push({
        page_number: page.num,
        char_count: pageText.length,
        line_count: pageText.split('\n').length,
      });
      fullTextParts.push(pageText);
    }

    const rawFullText = fullTextParts.join('\n\n').trim();
    if (!rawFullText) {
      console.warn(`Warning: No text content found in ${filePath}`);
      return [];
    }

    const normalizedContent = normalizeText(rawFullText);
    if (!normalizedContent) {
      console.warn(`Warning: Normalized PDF content is empty: ${filePath}`);
      return [];
    }

    const source = toPosixPath(path.relative(RAW_DIR, filePath));
    const filename = path.basename(filePath);
    const contentHash = md5Hash(normalizedContent);
    const totalChars = normalizedContent.length;

    const baseMetadata = {
      source,
      filename,
      file_type: 'pdf',
      content_hash: contentHash,
      total_chars: totalChars,
      total_pages: pagesInfo.length,
      pages_info: pagesInfo,
      language: 'en',
    };

    const chunks = chunkText(
      normalizedContent,
      PDF_CHUNK_SIZE,
      PDF_CHUNK_OVERLAP,
    );

    return chunks.map((chunk, index) => ({
      content: chunk,
      metadata: {
        ...baseMetadata,
        chunk_index: index,
        chunk_count: chunks.length,
        chunk_size: chunk.length,
        is_chunked: true,
      },
    }));
  }
}
