import { Inject, Injectable } from '@nestjs/common';
import { DrizzleDB } from './drizzle.provider';
import {
  InsertTelegramUser,
  TelegramUser,
  telegramUsers,
} from './drizzle/schema';
import { eq } from 'drizzle-orm';

export type TelegramUserContextFrom = {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_bot?: boolean;
  is_premium?: boolean;
};

@Injectable()
export class UserService {
  constructor(@Inject(DrizzleDB) private readonly db: DrizzleDB) {}
  public findOrCreateUser(
    telegramUserData: TelegramUserContextFrom,
  ): TelegramUser | InsertTelegramUser {
    const user = this.db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramUserData.id))
      .get();

    if (user) {
      // Update last interaction time
      const updatedUser = this.db
        .update(telegramUsers)
        .set({
          lastInteractionAt: new Date(),
        })
        .where(eq(telegramUsers.telegramId, user.telegramId))
        .returning()
        .get();

      return updatedUser;
    }

    return this.createUser(telegramUserData);
  }

  public getUserById(telegramId: number): TelegramUser | undefined {
    return this.db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId))
      .get();
  }
  public createUser(
    telegramUserData: TelegramUserContextFrom,
  ): InsertTelegramUser {
    const newUser = {
      telegramId: telegramUserData.id,
      username: telegramUserData.username || null,
      firstName: telegramUserData.first_name,
      lastName: telegramUserData.last_name || null,
      languageCode: telegramUserData.language_code || null,
      locale: telegramUserData.language_code || 'en',
      isBot: telegramUserData.is_bot || false,
      isPremium: telegramUserData.is_premium || null,
      isActive: true,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastInteractionAt: new Date(),
    };
    return this.db.insert(telegramUsers).values(newUser).returning().get();
  }
  public updateUser(
    telegramId: number,
    updateData: Partial<InsertTelegramUser>,
  ): InsertTelegramUser {
    return this.db
      .update(telegramUsers)
      .set({ ...updateData })
      .where(eq(telegramUsers.telegramId, telegramId))
      .returning()
      .get();
  }
  public deleteUser(telegramId: number): boolean {
    const result = this.db
      .delete(telegramUsers)
      .where(eq(telegramUsers.telegramId, telegramId))
      .run();

    return result.changes > 0; // вернули true если удалили, false если не нашли
  }
}
