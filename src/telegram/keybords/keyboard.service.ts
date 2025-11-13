import { Keyboard } from 'grammy';
import { Injectable } from '@nestjs/common';
import { MyContext } from '../types/session';

@Injectable()
export class KeyboardManager {
  constructor() {}

  public getMainMenu(ctx: MyContext): Keyboard {
    return new Keyboard()
      .text(ctx.t('about'))
      .text(ctx.t('community'))
      .row()
      .text(ctx.t('education'))
      .text(ctx.t('mining'))
      .row()
      .text(ctx.t('price_and_market'))
      .text(ctx.t('technology'))
      .row()
      .text(ctx.t('help'))
      .text(ctx.t('settings'))
      .resized();
  }
  public getLessonsNavigate(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('back')).text(ctx.t('next_lesson'));
  }
  public getSettingsMenu(ctx: MyContext): Keyboard {
    return new Keyboard()
      .text(ctx.t('language'))
      .row()
      .text(ctx.t('back'))
      .resized();
  }

  public getLanguageMenu(ctx: MyContext): Keyboard {
    return new Keyboard()
      .text(ctx.t('language_en'))
      .text(ctx.t('language_ru'))
      .row()
      .text(ctx.t('back'))
      .resized();
  }

  public getBackOnly(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('back')).resized();
  }
  public getConversationStart(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('back')).text(ctx.t('next')).resized();
  }
  public getConversationProcess(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('back')).text(ctx.t('next')).resized();
  }
  public getConversationEnd(ctx: MyContext): Keyboard {
    return new Keyboard().text(ctx.t('back')).text(ctx.t('done')).resized();
  }
}
