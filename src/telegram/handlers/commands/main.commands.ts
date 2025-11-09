import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Bot } from 'grammy';
import { DrizzleDB } from 'src/db/drizzle.provider';

import { telegramUsers } from 'src/db/drizzle/schema';
import { DocumentLoader } from 'src/document-loader/document-loader.service';
import { KeyboardManager } from 'src/telegram/keybords/keyboard.service';
import { MyContext } from 'src/telegram/types/session';

export type CommandDescriptionItem = {
  command: string;
  description: string;
};

@Injectable()
export class MainCommandsService implements OnModuleInit {
  private readonly logger = new Logger(MainCommandsService.name);
  private readonly commandsDescription: CommandDescriptionItem[] = [
    { command: 'start', description: 'Start the bot' },
    { command: 'help', description: 'Show help text' },
    { command: 'settings', description: 'Open settings' },
  ];
  constructor(
    private readonly bot: Bot<MyContext>,
    private readonly documentLoader: DocumentLoader,
    @Inject(DrizzleDB) private readonly db: DrizzleDB,
    private readonly keyboardManager: KeyboardManager,
  ) {}

  onModuleInit() {
    this.commandRegister();
    this.bot.api.setMyCommands(this.commandsDescription);
  }

  private commandRegister() {
    this.bot.command('start', this.startCommand);
    this.bot.command('help', this.helpCommand);
    this.bot.command('settings', this.settingsCommand);
    this.bot.command('select_locale', this.selectLocaleCommand);
    this.bot.command('set_locale_en', this.setLocaleEnCommand);
    this.bot.command('set_locale_ru', this.setLocaleRuCommand);
    this.bot.command('technology', this.technologyCommand);
    this.bot.command('mining', this.miningCommand);
    this.bot.command('priceandmarket', this.priceAndMarketCommand);
    this.bot.command('about', this.aboutCommand);
    this.bot.command('community', this.communityCommand);
  }

  private startCommand = async (ctx: MyContext) => {
    await ctx.reply(ctx.t('greeting'));
  };
  private helpCommand = async (ctx: MyContext) => {
    const result = this.db.select().from(telegramUsers).all();
    console.log('result: ', result);
    await ctx.reply('help');
  };
  private settingsCommand = async (ctx: MyContext) => {
    await ctx.reply('settings', {
      reply_markup: this.keyboardManager.getSettingsMenu(ctx),
    });
  };
  private selectLocaleCommand = async (ctx: MyContext) => {
    // const keyboard = new Keyboard();

    // keyboard.text('English').text('Русский').row().resized();
    await ctx.reply('Select language', {
      reply_markup: this.keyboardManager.getLanguageMenu(ctx),
    });
  };
  private aboutCommand = async (ctx: MyContext) => {
    const result = this.documentLoader.getDocumentContent('commands/about');
    await ctx.reply(result || 'content non found');
  };
  private priceAndMarketCommand = async (ctx: MyContext) => {
    const content = this.documentLoader.getDocumentContent(
      'commands/price_and_market',
    );
    await ctx.reply(content);
  };
  private technologyCommand = async (ctx: MyContext) => {
    const content = this.documentLoader.getDocumentContent(
      'commands/technology',
    );
    await ctx.reply(content);
  };
  private communityCommand = async (ctx: MyContext) => {
    const content =
      this.documentLoader.getDocumentContent('commands/community');
    await ctx.reply(content);
  };
  private miningCommand = async (ctx: MyContext) => {
    const content = this.documentLoader.getDocumentContent('commands/mining');
    await ctx.reply(content);
  };
  private setLocaleRuCommand = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('ru');
    await ctx.reply(ctx.t('current_locale'));
  };

  private setLocaleEnCommand = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('en');
    await ctx.reply(ctx.t('current_locale'));
  };
}
