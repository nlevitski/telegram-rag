import { MyContext } from 'src/telegram/types/session';
import { MainCommandsService } from './../commands/main.commands';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { KeyboardManager } from 'src/telegram/keybords/keyboard.service';
import { UserService } from 'src/db/user.service';
import { convertMarkdownToTelegramHtml } from 'src/telegram/utils/telegram-html';

@Injectable()
export class MainHandlersService implements OnModuleInit {
  private readonly hears = {
    about: ['🤖 About Qubic', '🤖 О Qubic'],
    community: ['🤝 Community', '🤝 Сообщество'],
    help: ['❓ Help', '❓ Помощь'],
    mining: ['⛏️ Mining', '⛏️ Майнинг'],
    priceandmarket: ['💰 Price & Market', '💰 Цена и рынок'],
    settings: ['🛠️ Settings', '🛠️ Настройки'],
    language: ['🌍 Language', '🌍 Язык'],
    technology: ['⚡️ Technology', '⚡️ Технологии'],
    education: ['🎓 Education', '🎓 Обучение'],
    nft: ['🔐 NFT'],
    done: ['✅ Done', '✅ Готово'],
    back: ['↩ Back', '↩ Назад'],
    enLocale: ['🇬🇧 English', '🇬🇧 Английский'],
    ruLocale: ['🇷🇺 Russian', '🇷🇺 Русский'],
    ask: ['🌀 Ask any question', '🌀 Задать произвольный вопрос']
  };
  constructor(
    private readonly bot: Bot<MyContext>,
    private readonly mainCommandsService: MainCommandsService,
    private readonly keyboardManager: KeyboardManager,
    private readonly userService: UserService,
  ) { }
  onModuleInit() {
    this.hearsRegister();
  }

  private replyHtml(
    ctx: MyContext,
    text: string,
    options?: Parameters<MyContext['reply']>[1],
  ) {
    const html = convertMarkdownToTelegramHtml(text);
    return ctx.reply(html, { ...(options || {}), parse_mode: 'HTML' });
  }

  private hearsRegister() {
    this.bot.hears(this.hears.about, this.mainCommandsService.aboutCommand);
    this.bot.hears(
      this.hears.community,
      this.mainCommandsService.communityCommand,
    );
    this.bot.hears(this.hears.help, this.mainCommandsService.helpCommand);
    this.bot.hears(this.hears.mining, this.mainCommandsService.miningCommand);
    this.bot.hears(
      this.hears.priceandmarket,
      this.mainCommandsService.priceAndMarketCommand,
    );
    this.bot.hears(
      this.hears.technology,
      this.mainCommandsService.technologyCommand,
    );
    this.bot.hears(
      this.hears.education,
      this.mainCommandsService.educationCommand,
    );
    this.bot.hears(this.hears.nft, this.mainCommandsService.nftCommand);
    this.bot.hears(
      this.hears.settings,
      this.mainCommandsService.settingsCommand,
    );
    this.bot.hears(this.hears.help, this.mainCommandsService.helpCommand);
    this.bot.hears(this.hears.back, this.mainCommandsService.backCommand);
    this.bot.hears(
      this.hears.language,
      this.mainCommandsService.selectLocaleCommand,
    );
    this.bot.hears(this.hears.done, this.doneEducation);
    this.bot.hears(this.hears.enLocale, this.setEnLocale);
    this.bot.hears(this.hears.ruLocale, this.setRuLocale);
    this.bot.hears('step', this.mainCommandsService.echoStepCommand);
    this.bot.hears(this.hears.ask, this.mainCommandsService.askAnyCommand);
  }
  private doneEducation = async (ctx: MyContext) => {
    await this.replyHtml(ctx, ctx.t('main_menu'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
  private setEnLocale = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('en');
    ctx.session.__language_code = 'en';
    ctx.session.locale = 'en';
    if (ctx.from?.id) {
      this.userService.updateUser(ctx.from.id, { locale: 'en' });
    }
    if (ctx.session.step === 'select_language') {
      return this.replySettings(ctx);
    }
    await this.replyHtml(ctx, ctx.t('current_locale'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
  private setRuLocale = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('ru');
    ctx.session.__language_code = 'ru';
    ctx.session.locale = 'ru';
    if (ctx.from?.id) {
      this.userService.updateUser(ctx.from.id, { locale: 'ru' });
    }
    if (ctx.session.step === 'select_language') {
      return this.replySettings(ctx);
    }
    await this.replyHtml(ctx, ctx.t('current_locale'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
  private replySettings = async (ctx: MyContext) => {
    ctx.session.step = 'settings';
    await this.replyHtml(ctx, ctx.t('current_locale'), {
      reply_markup: this.keyboardManager.getSettingsMenu(ctx),
    });
  };
}
