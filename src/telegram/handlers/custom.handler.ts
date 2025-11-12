import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { MyContext } from '../types/session';

@Injectable()
export class CustomMessageHandler implements OnModuleInit {
  constructor(private readonly bot: Bot<MyContext>) {}
  onModuleInit() {
    this.bot.on('message:text', this.customMessageHandler);
  }

  private customMessageHandler = async (ctx: MyContext) => {
    const result = ctx.message!.text;
    await ctx.reply(result || '');
  };
}
