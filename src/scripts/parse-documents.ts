import { DocumentParser } from '../documents/document-parser';

async function bootstrap() {
  const parser = new DocumentParser();
  const summary = await parser.parseAll();

  console.log('--- Parsing Summary ---');
  console.log(
    `Markdown: ${summary.markdown.files} files, ${summary.markdown.chunks} chunks`,
  );
  console.log(`PDF: ${summary.pdf.files} files, ${summary.pdf.chunks} chunks`);
}

bootstrap().catch((error) => {
  console.error('Document parsing failed:', error);
  process.exit(1);
});
