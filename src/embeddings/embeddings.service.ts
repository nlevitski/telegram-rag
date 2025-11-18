import { Injectable, OnModuleInit } from '@nestjs/common';
import { pipeline, env, FeatureExtractionPipeline } from '@xenova/transformers';
env.allowLocalModels = false;
env.localModelPath = './models'; // опционально: свой кэш
env.cacheDir = './models';

@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private extractor: FeatureExtractionPipeline;

  async onModuleInit() {
    this.extractor = await pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
      { quantized: true },
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Конвертация в обычный массив
    return Array.from(output.data) as number[];
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
      texts.map((text) => this.generateEmbedding(text)),
    );
    return embeddings;
  }
}
