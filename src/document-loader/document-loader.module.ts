import { Global, Module } from '@nestjs/common';
import { DocumentLoader } from './document-loader.service';

@Global()
@Module({
  providers: [DocumentLoader],
  exports: [DocumentLoader],
})
export class DocumentLoaderModule {}
