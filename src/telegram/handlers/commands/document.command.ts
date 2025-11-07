// import { Context } from 'grammy';
// import { Injectable } from '@nestjs/common';
// import { DocumentLoader } from '../../../document-loader/document-loader.service';

// // Типы для команд документов
// interface DocumentCommandConfig {
//   command: string;
//   description: string;
//   documentKey: string;
// }

// @Injectable()
// export class DocumentCommand {
//   constructor(
//     private readonly documentLoader: DocumentLoader,
//     private readonly config: DocumentCommandConfig,
//   ) {
//     super();
//     this.config = config;
//   }

//   get metadata() {
//     return {
//       command: this.config.command,
//       description: this.config.description,
//     };
//   }

//   async execute(ctx: Context) {
//     this.logExecution(ctx);

//     // Определяем язык пользователя (простая логика)
//     const language = ctx.from?.language_code?.startsWith('en') ? 'en' : 'ru';

//     const content = this.documentLoader.getContent(
//       this.config.documentKey,
//       language,
//     );

//     if (!content) {
//       await this.reply(
//         ctx,
//         `❌ Извините, содержимое для команды /${this.config.command} не найдено.`,
//       );
//       return;
//     }

//     await this.reply(ctx, content, {
//       parse_mode: 'Markdown',
//     });
//   }
// }

// // Фабрика для создания команд документов
// @Injectable()
// export class DocumentCommandFactory {
//   constructor(private readonly documentLoader: DocumentLoader) {}

//   createCommands(): DocumentCommand[] {
//     const commandConfigs: DocumentCommandConfig[] = [
//       {
//         command: 'about',
//         description: 'О проекте Qubic',
//         documentKey: 'about',
//       },
//       {
//         command: 'mining',
//         description: 'Майнинг Qubic',
//         documentKey: 'mining',
//       },
//       {
//         command: 'technology',
//         description: 'Технологии проекта',
//         documentKey: 'technology',
//       },
//       {
//         command: 'community',
//         description: 'Сообщество проекта',
//         documentKey: 'community',
//       },
//       {
//         command: 'priceandmarket',
//         description: 'Цена и рынок',
//         documentKey: 'priceandmarket',
//       },
//     ];

//     return commandConfigs.map(
//       (config) => new DocumentCommand(this.documentLoader, config),
//     );
//   }
// }
