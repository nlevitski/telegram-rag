import { Context, SessionFlavor } from 'grammy';
import { I18nFlavor } from '@grammyjs/i18n';
import {
  type Conversation,
  type ConversationFlavor,
} from '@grammyjs/conversations';
export interface SessionData {
  telegramId: number;
  step?: string;
  locale?: string;
  __language_code: string;
  tempData?: any;
}

export type MyContext = ConversationFlavor<
  Context & SessionFlavor<SessionData> & I18nFlavor
>;
export type MyConversation = Conversation<MyContext>;
