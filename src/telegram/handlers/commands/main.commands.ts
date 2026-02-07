import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Bot } from 'grammy';
import { DrizzleDB } from 'src/db/drizzle.provider';
import { DocumentLoader } from 'src/document-loader/document-loader.service';
import { UserService } from 'src/db/user.service';
import { KeyboardManager } from 'src/telegram/keybords/keyboard.service';
import { MyContext } from 'src/telegram/types/session';
import { convertMarkdownToTelegramHtml } from 'src/telegram/utils/telegram-html';

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
    { command: 'step', description: 'Echo current step' },
    { command: 'education', description: 'Lessons' },
    { command: 'ask', description: 'Ask any question' },
  ];
  constructor(
    private readonly bot: Bot<MyContext>,
    private readonly documentLoader: DocumentLoader,
    @Inject(DrizzleDB) private readonly db: DrizzleDB,
    private readonly keyboardManager: KeyboardManager,
    private readonly userService: UserService,
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

    this.bot.command('about', this.aboutCommand);
    this.bot.command('community', this.communityCommand);
    this.bot.command('mining', this.miningCommand);
    this.bot.command('priceandmarket', this.priceAndMarketCommand);
    this.bot.command('technology', this.technologyCommand);
    this.bot.command('education', this.educationCommand);
    this.bot.command('nft', this.nftCommand);
    this.bot.command('ask', this.askAnyCommand);
    this.bot.command('back', this.backCommand);
    this.bot.command('step', this.echoStepCommand);
  }

  private toHtml(text: string) {
    return convertMarkdownToTelegramHtml(text, this.logger);
  }

  private replyHtml(
    ctx: MyContext,
    text: string,
    options?: Parameters<MyContext['reply']>[1],
  ) {
    const html = this.toHtml(text);
    return ctx.reply(html, { ...(options || {}), parse_mode: 'HTML' });
  }

  public startCommand = async (ctx: MyContext) => {
    ctx.session.step = 'main_menu';
    await this.replyHtml(ctx, ctx.t('greeting'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
  public helpCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/help',
      locale,
    );

    await this.replyHtml(ctx, content);
  };
  public settingsCommand = async (ctx: MyContext) => {
    ctx.session.step = 'settings';
    await this.replyHtml(ctx, ctx.t('settings'), {
      reply_markup: this.keyboardManager.getSettingsMenu(ctx),
    });
  };
  public selectLocaleCommand = async (ctx: MyContext) => {
    ctx.session.step = 'select_language';
    await this.replyHtml(ctx, ctx.t('select_language'), {
      reply_markup: this.keyboardManager.getLanguageMenu(ctx),
    });
  };
  public aboutCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const result = this.documentLoader.getDocumentContent(
      'commands/about',
      locale,
    );
    await this.replyHtml(ctx, result || 'content non found');
  };
  public communityCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/community',
      locale,
    );
    await this.replyHtml(ctx, content);
  };

  public educationCommand = async (ctx: MyContext) => {
    await ctx.conversation.enter('education');
  };

  public miningCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/mining',
      locale,
    );
    await this.replyHtml(ctx, content);
  };
  public priceAndMarketCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/price_and_market',
      locale,
    );
    await this.replyHtml(ctx, content);
  };
  public technologyCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/technology',
      locale,
    );
    await this.replyHtml(ctx, content);
  };
  public nftCommand = async (ctx: MyContext) => {
    const locale = await ctx.i18n.getLocale();
    const content = this.documentLoader.getDocumentContent(
      'commands/nft',
      locale,
    );
    await this.replyHtml(ctx, content);
  };
  public backCommand = async (ctx: MyContext) => {
    if (ctx.session.step === 'select_language') {
      ctx.session.step = 'settings';
      return await this.replyHtml(ctx, ctx.t('settings'), {
        reply_markup: this.keyboardManager.getSettingsMenu(ctx),
      });
    }
    ctx.session.step = 'main_menu';
    return await this.replyHtml(ctx, ctx.t('back'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };

  public setLocaleRuCommand = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('ru');
    ctx.session.__language_code = 'ru';
    ctx.session.locale = 'ru';
    if (ctx.from?.id) {
      this.userService.updateUser(ctx.from.id, { locale: 'ru' });
    }
    if (ctx.session.step === 'select_language') {
      ctx.session.step = 'settings';
      return await this.replyHtml(ctx, ctx.t('settings'), {
        reply_markup: this.keyboardManager.getSettingsMenu(ctx),
      });
    }
    await this.replyHtml(ctx, ctx.t('current_locale'));
  };

  public setLocaleEnCommand = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('en');
    ctx.session.__language_code = 'en';
    ctx.session.locale = 'en';
    if (ctx.from?.id) {
      this.userService.updateUser(ctx.from.id, { locale: 'en' });
    }
    if (ctx.session.step === 'select_language') {
      ctx.session.step = 'settings';
      return await this.replyHtml(ctx, ctx.t('settings'), {
        reply_markup: this.keyboardManager.getSettingsMenu(ctx),
      });
    }
    await this.replyHtml(ctx, ctx.t('current_locale'));
  };
  public echoStepCommand = async (ctx: MyContext) => {
    await this.replyHtml(ctx, ctx.session.step || 'no step');
  };
  public askAnyCommand = async (ctx: MyContext) => {
    return await this.replyHtml(ctx, ctx.t('askAnyQuestion'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
}
