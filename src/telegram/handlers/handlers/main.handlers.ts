import { MyContext } from 'src/telegram/types/session';
import { MainCommandsService } from './../commands/main.commands';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { KeyboardManager } from 'src/telegram/keybords/keyboard.service';

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
    back: ['↩ Back', '↩ Назад'],
    enLocale: ['🇬🇧 English', '🇬🇧 Английский'],
    ruLocale: ['🇷🇺 Russian', '🇷🇺 Русский'],
  };
  constructor(
    private readonly bot: Bot<MyContext>,
    private readonly mainCommandsService: MainCommandsService,
    private readonly keyboardManager: KeyboardManager,
  ) {}
  onModuleInit() {
    this.hearsRegister();
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
      this.hears.settings,
      this.mainCommandsService.settingsCommand,
    );
    this.bot.hears(this.hears.help, this.mainCommandsService.helpCommand);
    this.bot.hears(this.hears.back, this.mainCommandsService.backCommand);
    this.bot.hears(
      this.hears.language,
      this.mainCommandsService.selectLocaleCommand,
    );
    this.bot.hears(this.hears.enLocale, this.setEnLocale);
    this.bot.hears(this.hears.ruLocale, this.setRuLocale);
  }
  private setEnLocale = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('en');
    await ctx.reply(ctx.t('current_locale'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
  private setRuLocale = async (ctx: MyContext) => {
    await ctx.i18n.setLocale('ru');
    await ctx.reply(ctx.t('current_locale'), {
      reply_markup: this.keyboardManager.getMainMenu(ctx),
    });
  };
}
