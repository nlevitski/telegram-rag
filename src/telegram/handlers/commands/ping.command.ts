// import { Context } from 'grammy';
// import { Injectable } from '@nestjs/common';
// import { BaseCommand } from '../base.command';
// import { RateLimitMiddleware, StatsMiddleware } from '../middleware';

// @Injectable()
// export class PingCommand extends BaseCommand {
//   constructor(
//     private readonly rateLimitMiddleware: RateLimitMiddleware,
//     private readonly statsMiddleware: StatsMiddleware,
//   ) {
//     super();
//   }

//   get metadata() {
//     return {
//       command: 'ping',
//       description: 'Проверить работу бота (с ограничением частоты)',
//       middleware: [
//         this.rateLimitMiddleware.middleware(500, 10), // 500ms cooldown, 10 per minute
//         this.statsMiddleware.middleware('ping'),
//       ],
//     };
//   }

//   async execute(ctx: Context) {
//     this.logExecution(ctx);

//     const pingTime = Date.now();
//     const message = await this.reply(ctx, '🏓 Pong!');
//     const pongTime = Date.now();

//     const responseTime = pongTime - pingTime;

//     // Редактируем сообщение с временем отклика
//     if (message && 'edit_message_text' in ctx) {
//       await ctx.api.editMessageText(
//         message.chat.id,
//         message.message_id,
//         `🏓 Pong! (${responseTime}ms)`,
//       );
//     }
//   }
// }
