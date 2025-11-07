import { Bot } from 'grammy';

export interface TelegramHandler {
  register(bot: Bot): void;
}
