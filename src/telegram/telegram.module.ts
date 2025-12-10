import { Module, DynamicModule } from '@nestjs/common';
import { Bot } from 'grammy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { MainCommandsService } from './handlers/commands/main.commands';
import { DocumentLoaderModule } from 'src/document-loader/document-loader.module';
import { CustomMessageHandler } from './handlers/custom.handler';
import { MiddlewareService } from './middleware/middleware.service';

import { KeyboardManager } from './keybords/keyboard.service';

import { GrammyI18nProvider } from './providers/grammy-i18n.provider';
import { SessionStorageAdapter } from './adapters/session-storage.adapter';
import { MainHandlersService } from './handlers/handlers/main.handlers';
import { LlmModule } from '../llm/llm.module';
import { QdrantModule } from '../qdrant/qdrant.module';
// import { ConversationManager } from './conversation/converstion.service';
@Module({})
export class TelegramModule {
  static forRoot(): DynamicModule {
    return {
      module: TelegramModule,
      imports: [ConfigModule, DocumentLoaderModule, LlmModule, QdrantModule],
      providers: [
        {
          provide: Bot,
          useFactory: (configService: ConfigService) => {
            const token =
              configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
            return new Bot(token);
          },
          inject: [ConfigService],
        },
        KeyboardManager,
        SessionStorageAdapter,
        GrammyI18nProvider,
        // ConversationManager,
        MiddlewareService,
        MainCommandsService,
        MainHandlersService,
        CustomMessageHandler,
        TelegramService,
      ],
      exports: [Bot],
    };
  }
}
