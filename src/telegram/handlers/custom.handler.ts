import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, Context } from 'grammy';

@Injectable()
export class CustomMessageHandler implements OnModuleInit {
  constructor(private readonly bot: Bot<Context>) {}
  onModuleInit() {
    this.bot.on('message:text', this.customMessageHandler);
  }
  private customMessageHandler = async (ctx: Context) => {
    const result = ctx.message!.text;
    await ctx.reply(result || '');
  };
}
