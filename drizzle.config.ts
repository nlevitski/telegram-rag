import type { Config } from 'drizzle-kit';
export default {
  schema: './src/db/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/telegram-rag.db',
  },
} satisfies Config;
