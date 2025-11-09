import { Keyboard } from 'grammy';
import { Injectable } from '@nestjs/common';
import { MyContext } from '../types/session';

@Injectable()
export class KeyboardManager {
  constructor() {}

  getMainMenu(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('greeting')).resized();
  }

  getSettingsMenu(ctx: MyContext): Keyboard {
    return new Keyboard()
      .text(ctx.t('language'))
      .row()
      .text(ctx.t('back'))
      .resized();
  }

  getLanguageMenu(ctx: MyContext): Keyboard {
    return new Keyboard()
      .text(ctx.t('language_en'))
      .text(ctx.t('language_ru'))
      .row()
      .text(ctx.t('back'))
      .resized();
  }

  getBackOnly(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('back')).resized();
  }

  // Дополнительные методы для специфичных клавиатур
  // getWelcomeKeyboard(ctx: MyContext): Keyboard {
  //   const supportedLocales = [
  //     { code: 'en', emoji: '🇺🇸', text: 'English' },
  //     { code: 'ru', emoji: '🇷🇺', text: 'Русский' },
  //   ];

  //   const keyboard = new Keyboard();

  //   supportedLocales.forEach((lang, index) => {
  //     if (index > 0 && index % 2 === 0) {
  //       keyboard.row();
  //     }
  //     keyboard.text(`${lang.emoji} ${lang.text}`);
  //   });

  //   return keyboard.resized();
  // }
}
