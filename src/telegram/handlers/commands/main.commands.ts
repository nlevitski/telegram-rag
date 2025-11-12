import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Bot } from 'grammy';
import { DrizzleDB } from 'src/db/drizzle.provider';
import { telegramUsers } from 'src/db/drizzle/schema';
import { DocumentLoader } from 'src/document-loader/document-loader.service';
import { KeyboardManager } from 'src/telegram/keybords/keyboard.service';
import { MyContext } from 'src/telegram/types/session';
import { convert } from 'telegram-markdown-v2';

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
    { command: 'select_locale', description: 'Select Language Menu' },
    { command: 'set_locale_en', description: 'Set Russian Language' },
    { command: 'set_locale_ru', description: 'Set English Language' },
    { command: 'about', description: 'Info about Qubic' },
    { command: 'community', description: 'Community Info' },
    { command: 'mining', description: 'Mining Info' },
    { command: 'priceandmarket', description: 'Price & Market Info' },
    { command: 'technology', description: 'Technology Info' },
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
    this.bot.command('back', this.backCommand);
  }

  public startCommand = async (ctx: MyContext) => {
    await ctx.reply(ctx.t('greeting'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
  public helpCommand = async (ctx: MyContext) => {
    const result = this.db.select().from(telegramUsers).all();
    console.log('result: ', result);
    await ctx.reply('help');
  };
  public settingsCommand = async (ctx: MyContext) => {
    await ctx.reply('settings', {
      reply_markup: this.keyboardManager.getSettingsMenu(ctx),
    });
  };
  public selectLocaleCommand = async (ctx: MyContext) => {
    await ctx.reply('Select language', {
      reply_markup: this.keyboardManager.getLanguageMenu(ctx),
    });
  };
  public aboutCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const result = this.documentLoader.getDocumentContent(
      'commands/about',
      locale,
    );
    const md = convert(result, 'keep');
    await ctx.reply(md || 'content non found');
  };
  public communityCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/community',
      locale,
    );
    await ctx.reply(content);
  };
  public miningCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/mining',
      locale,
    );
    await ctx.reply(content);
  };
  public priceAndMarketCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/price_and_market',
      locale,
    );
    await ctx.reply(content);
  };
  public technologyCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/technology',
      locale,
    );
    await ctx.reply(content);
  };

  public backCommand = async (ctx: MyContext) => {
    await ctx.reply(ctx.t('back'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };

  public setLocaleRuCommand = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('ru');
    await ctx.reply(ctx.t('current_locale'));
  };

  public setLocaleEnCommand = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('en');
    await ctx.reply(ctx.t('current_locale'));
  };
}
