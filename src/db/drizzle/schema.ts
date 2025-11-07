import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const telegramUsers = sqliteTable('telegram_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Telegram данные
  telegramId: integer('telegram_id').notNull().unique(), // уникальный ID пользователя в Telegram
  username: text('username'), // @username (может отсутствовать)
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  languageCode: text('language_code'), // язык интерфейса Telegram (ru, en, etc.)

  // Настройки бота
  locale: text('locale').notNull().default('en'), // выбранная локаль в боте
  isBot: integer('is_bot', { mode: 'boolean' }).notNull().default(false),
  isPremium: integer('is_premium', { mode: 'boolean' }).default(false),

  // Метаданные
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isBlocked: integer('is_blocked', { mode: 'boolean' })
    .notNull()
    .default(false),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  lastInteractionAt: integer('last_interaction_at', { mode: 'timestamp' }),
});

export type TelegramUser = typeof telegramUsers.$inferSelect;
export type NewTelegramUser = typeof telegramUsers.$inferInsert;
