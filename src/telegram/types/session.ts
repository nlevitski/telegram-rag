import { Context, SessionFlavor } from 'grammy';
import { I18nFlavor } from '@grammyjs/i18n';

export interface SessionData {
  telegramId: number;
  step?: string;
  locale?: string;
  __language_code?: string;
  tempData?: any;
}

export type MyContext = Context & SessionFlavor<SessionData> & I18nFlavor;
