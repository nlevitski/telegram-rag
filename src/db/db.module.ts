import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DrizzleDB } from './drizzle.provider';
import * as schema from './drizzle/schema';
import { UserService } from './user.service';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: DrizzleDB,
          useFactory: (configService: ConfigService) => {
            const dbPath = configService.getOrThrow<string>('DATABASE');
            const sqlite = new Database(dbPath);
            return drizzle(sqlite, { schema });
          },
          inject: [ConfigService],
        },
        UserService,
      ],
      exports: [DrizzleDB, UserService],
    };
  }
}
