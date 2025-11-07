import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { DocumentLoaderModule } from './document-loader/document-loader.module';
import { DatabaseModule } from './db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forRoot(),
    TelegramModule.forRoot(),
    DocumentLoaderModule,
  ],
})
export class AppModule {}
