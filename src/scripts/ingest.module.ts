import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestionModule } from '../ingestion/ingestion.module';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env' : '.env.development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFile, '.env'],
    }),
    IngestionModule,
  ],
})
export class IngestModule {}
