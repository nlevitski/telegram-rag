// import { LoadItem } from './document-loader.service';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { extname, join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';

// export type LoadItem = {
//   key: string;
//   path: string;
// };
// export type Part = {
//   partname: string;
//   baseDir: string;
//   loadItems: LoadItem[];
// };
// export type LoadConfig = {
//   parts: Part[];
//   locales: string[];
//   ext: string;
// };

@Injectable()
export class DocumentLoader implements OnModuleInit {
  private readonly logger = new Logger(DocumentLoader.name);
  private localeFallback = {
    en: 'Content not found',
    ru: 'Содержание не найдено',
  };
  private filePaths: string[] = [];
  private targetDir = join(process.cwd(), 'documents', 'md');
  private targetExt = '.md';
  private contentMap = new Map<string, Map<string, string>>(); // command -> locale -> content

  constructor() {}

  async onModuleInit() {
    this.logger.log('document loader init ✅');
    await this.findTargetFiles();
    await this.parseFilesToMapWithContent(this.contentMap);
    const priceMarketContent = this.contentMap.get('lessons/lesson_3');
    if (priceMarketContent) {
      const englishContent = priceMarketContent.get('en');
      if (englishContent) {
        this.logger.log(englishContent);
      }
    }
  }
  private async findTargetFiles() {
    await this.scanDirectory(this.targetDir);
  }
  private scanDirectory = async (path: string) => {
    try {
      const items = await readdir(path, { withFileTypes: true });
      for (const item of items) {
        const fullPath = join(path, item.name);
        if (item.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (
          item.isFile() &&
          extname(item.name).toLowerCase() === this.targetExt
        ) {
          this.filePaths.push(fullPath);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Ошибка при сканировании ${path}: ${errorMessage}`);
    }
  };

  private async parseFilesToMapWithContent(
    targetMap: Map<string, Map<string, string>>,
  ) {
    const prefixLength = this.targetDir.endsWith('/')
      ? this.targetDir.length
      : this.targetDir.length + 1;

    const extLength = this.targetExt.length;

    const fileContents = await Promise.all(
      this.filePaths.map((filePath) => readFile(filePath, 'utf-8')),
    );
    const len = this.filePaths.length;
    for (let i = 0; i < len; i++) {
      const filePath = this.filePaths[i];
      const content = fileContents[i];

      const relativePath = filePath.slice(prefixLength);
      const lastSlashIndex = relativePath.lastIndexOf('/');

      const key = relativePath.slice(0, lastSlashIndex);

      const locale = relativePath.slice(lastSlashIndex + 1, -extLength);

      if (!targetMap.has(key)) {
        targetMap.set(key, new Map<string, string>());
      }

      const localeMap = targetMap.get(key);
      if (localeMap) {
        localeMap.set(locale, content);
      }
    }
  }
  public getDocumentContent(
    documentName: string,
    locale: string = 'en',
  ): string {
    const fallback =
      (Object.hasOwn(this.localeFallback, locale) &&
        (this.localeFallback[locale] as string)) ||
      this.localeFallback.en;

    return this.contentMap.get(documentName)?.get(locale) || fallback;
  }
  // private readonly loadConfig: LoadConfig = {
  //   parts: [
  //     {
  //       partname: 'commands',
  //       baseDir: join(process.cwd(), 'documents', 'md', 'commands'),
  //       loadItems: [
  //         { key: 'about', path: 'about' },
  //         { key: 'mining', path: 'mining' },
  //         { key: 'technology', path: 'technology' },
  //         { key: 'community', path: 'community' },
  //         { key: 'priceandmarket', path: 'price_and_market' },
  //       ],
  //     },
  //     {
  //       partname: 'lessons',
  //       baseDir: join(process.cwd(), 'documents', 'md', 'lessons'),
  //       loadItems: [
  //         { key: 'lessons/lesson_1', path: 'lesson_1' },
  //         { key: 'lessons/lesson_2', path: 'lesson_2' },
  //         { key: 'lessons/lesson_3', path: 'lesson_3' },
  //         { key: 'lessons/lesson_4', path: 'lesson_4' },
  //         { key: 'lessons/lesson_5', path: 'lesson_5' },
  //         { key: 'lessons/lesson_6', path: 'lesson_6' },
  //       ],
  //     },
  //   ],
  //   locales: ['en', 'ru'],
  //   ext: '.md',
  // };

  // private async loadAll() {
  //   const { parts, locales, ext } = this.loadConfig;
  //   const preparedFilePaths = parts.flatMap(({ baseDir, loadItems }) =>
  //     loadItems.map(({ key, path }) => ({
  //       key,
  //       locales: locales.map((locale) => ({
  //         locale,
  //         path: join(baseDir, path, `${locale}${ext}`),
  //       })),
  //     })),
  //   );
  //   const loadedFiles = await Promise.all(
  //     preparedFilePaths.map(async ({ key, locales }) => {
  //       const loadedLocales = await Promise.all(
  //         locales.map(async ({ locale, path }) => {
  //           const content = await readFile(path, 'utf-8');
  //           return {
  //             locale,
  //             content,
  //           };
  //         }),
  //       );
  //       return {
  //         key,
  //         locales: loadedLocales,
  //       };
  //     }),
  //   );
  //   loadedFiles.forEach(({ key, locales }) => {
  //     this.contentMap.set(
  //       key,
  //       new Map(locales.map(({ locale, content }) => [locale, content])),
  //     );
  //   });
  //   console.log(this.contentMap.get('priceandmarket')?.get('en'));
  // }
}
