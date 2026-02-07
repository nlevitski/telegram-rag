import { DocumentParser } from '../documents/document-parser';

async function bootstrap() {
  const parser = new DocumentParser();
  const summary = await parser.parseMarkdownDirectory();

  console.log('--- Markdown Parsing Summary ---');
  console.log(`Markdown: ${summary.files} files, ${summary.chunks} chunks`);
}

bootstrap().catch((error) => {
  console.error('Markdown parsing failed:', error);
  process.exit(1);
});
