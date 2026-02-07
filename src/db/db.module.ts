import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { DrizzleDB } from './drizzle.provider';
import * as schema from './drizzle/schema';
import { UserService } from './user.service';
import * as fs from 'fs';
import * as path from 'path';

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
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            const sqlite = new Database(dbPath);
            sqlite.exec(`
              CREATE TABLE IF NOT EXISTS telegram_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id INTEGER NOT NULL UNIQUE,
                username TEXT,
                first_name TEXT NOT NULL,
                last_name TEXT,
                language_code TEXT,
                locale TEXT NOT NULL DEFAULT 'en',
                is_bot INTEGER NOT NULL DEFAULT 0,
                is_premium INTEGER DEFAULT 0,
                is_active INTEGER NOT NULL DEFAULT 1,
                is_blocked INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER,
                updated_at INTEGER,
                last_interaction_at INTEGER
              );
            `);
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
