import { StorageAdapter } from 'grammy';
import { SessionData } from '../types/session';
import { UserService } from 'src/db/user.service';
import { Injectable } from '@nestjs/common';

const defaultLocale = 'en';

@Injectable()
export class SessionStorageAdapter implements StorageAdapter<SessionData> {
  private readonly memoryCache = new Map<string, SessionData>();
  constructor(private userService: UserService) {}

  read(key: string): SessionData | undefined {
    if (!key) return undefined;
    const cachedUser = this.memoryCache.get(key);
    if (cachedUser) return cachedUser;

    const telegramId = parseInt(key);
    const user = this.userService.getUserById(telegramId);
    if (!user) return undefined;

    return this.memoryCache
      .set(key, {
        telegramId,
        __language_code: user.locale,
        conversation: {},
        step: 'main_menu',
      })
      .get(key);
  }
  write(key: string, value: SessionData): void {
    const memoryUser = this.memoryCache.get(key);
    const telegramId = parseInt(key);
    if (memoryUser?.__language_code !== value.__language_code) {
      this.userService.updateUser(telegramId, {
        locale: value.__language_code,
      });
    }
    this.memoryCache.set(key, {
      ...value,
      conversation: value.conversation || {},
    });
  }

  delete(key: string): void {
    // Опционально: можно очистить локаль
    this.memoryCache.delete(key);
    const telegramId = parseInt(key);
    this.userService.updateUser(telegramId, { locale: defaultLocale });
  }
}
