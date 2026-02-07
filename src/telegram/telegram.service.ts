import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Context } from 'grammy';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly bot: Bot<Context>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('🔍 TelegramService onModuleInit called');
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      const masked =
        token.length > 10
          ? `${token.slice(0, 4)}...${token.slice(-4)}`
          : token;
      this.logger.log(`🔐 Telegram token: ${masked}`);
    } else {
      this.logger.warn('⚠️ TELEGRAM_BOT_TOKEN is not set');
    }

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
