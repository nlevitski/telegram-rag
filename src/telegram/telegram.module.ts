import { Module, DynamicModule } from '@nestjs/common';
import { Bot } from 'grammy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { MainCommandsService } from './handlers/commands/main.commands';
import { DocumentLoaderModule } from 'src/document-loader/document-loader.module';
import { CustomMessageHandler } from './handlers/custom.handler';

@Module({})
export class TelegramModule {
  static forRoot(): DynamicModule {
    return {
      module: TelegramModule,
      imports: [ConfigModule, DocumentLoaderModule],
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
        MainCommandsService,
        CustomMessageHandler,
        TelegramService,
      ],
      exports: [Bot],
    };
  }
}
