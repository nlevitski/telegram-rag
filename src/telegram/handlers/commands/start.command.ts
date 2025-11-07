import { Context } from 'grammy';
import { Injectable } from '@nestjs/common';
// import { DocumentLoader } from '../../../document-loader/document-loader.service';
// private readonly documentLoader: DocumentLoader
@Injectable()
export class StartCommand {
  constructor() {}

  get metadata() {
    return {
      command: 'start',
      description: 'Запустить бота и показать приветствие',
    };
  }

  private logExecution(ctx: Context) {
    console.log(`Executing start command for user: ${ctx.from?.id}`);
  }

  private async reply(ctx: Context, text: string) {
    await ctx.reply(text);
  }

  async execute(ctx: Context) {
    this.logExecution(ctx);

    // const welcomeText =
    //   this.documentLoader.getContent('about', 'ru') ||
    //   '👋 Привет! Я бот на NestJS + grammY\n\n' +
    //     'Доступные команды:\n' +
    //     '/help - Показать помощь\n' +
    //     '/about - О боте';

    await this.reply(ctx, 'welcomeText');
  }
}
