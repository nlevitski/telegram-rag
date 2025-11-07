import { Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './drizzle/schema';

@Injectable()
export abstract class DrizzleDB extends BetterSQLite3Database<typeof schema> {}
