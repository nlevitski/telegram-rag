// import { Context } from 'grammy';
// import { Injectable } from '@nestjs/common';
// import { BaseCommand } from '../base.command';

// @Injectable()
// export class HelpCommand extends BaseCommand {
//   get metadata() {
//     return {
//       command: 'help',
//       description: 'Показать справку по командам',
//     };
//   }

//   async execute(ctx: Context) {
//     this.logExecution(ctx);

//     const helpText = `🧭 *Справка по командам*

// /start - Запустить бота
// /help - Показать эту справку
// /about - Информация о проекте
// /mining - Информация о майнинге
// /technology - Технологии проекта
// /community - Сообщество
// /priceandmarket - Цена и рынок

// 💡 *Совет*: Используйте /start для начала работы с ботом!`;

//     await this.reply(ctx, helpText, {
//       parse_mode: 'Markdown',
//     });
//   }
// }
