import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Bot, Context } from 'grammy';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly bot: Bot<Context>) {}

  async onModuleInit() {
    this.logger.log('🔍 TelegramService onModuleInit called');

    if (this.isRunning) {
      this.logger.log('Bot is already running, skipping startup');
      return;
    }

    this.logger.log('🚀 Launching Telegram bot...');

    // Команды автоматически регистрируются через MainCommandsService

    try {
      this.logger.log('🤖 Attempting to start bot...');
      await this.bot.start({
        drop_pending_updates: true,
        onStart: () => {
          this.isRunning = true;
          this.logger.log('✅ Telegram bot started successfully');
        },
      });
    } catch (error: unknown) {
      this.logger.error('❌ Failed to start bot:', error);

      // Если ошибка 409 (конфликт экземпляров), не падаем, а продолжаем работу
      if (
        error &&
        typeof error === 'object' &&
        'error_code' in error &&
        (error as { error_code: number }).error_code === 409
      ) {
        this.logger.warn(
          '⚠️ Bot instance conflict detected, but continuing...',
        );
        this.isRunning = true;
        return;
      }

      throw error;
    }
  }
  async onModuleDestroy() {
    if (!this.isRunning) {
      this.logger.log('Bot is not running, skip shutdown');
      return;
    }
    this.logger.log('🛑 Stopping Telegram bot...');
    await this.bot.stop().catch((error: unknown) => {
      console.error('Failed to stop Telegram module:', error);
    });
    this.isRunning = false;
    this.logger.log('✅ Bot stopped successfully');
  }

  sendMessage(chatId: number, text: string) {
    return this.bot.api.sendMessage(chatId, text);
  }
}
