import { DocumentParser } from '../documents/document-parser';

async function bootstrap() {
  const parser = new DocumentParser();
  const summary = await parser.parsePdfDirectory();

  console.log('--- PDF Parsing Summary ---');
  console.log(`PDF: ${summary.files} files, ${summary.chunks} chunks`);
}

bootstrap().catch((error) => {
  console.error('PDF parsing failed:', error);
  process.exit(1);
});
