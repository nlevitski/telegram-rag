import { StorageAdapter } from 'grammy';
import { SessionData } from '../types/session';
import { UserService } from 'src/db/user.service';
import { Injectable } from '@nestjs/common';

const defaultLocale = 'en';
export type UserSessionData = {
  telegramId: number;
  __language_code: string;
  step: string;
};
@Injectable()
export class SessionStorageAdapter implements StorageAdapter<SessionData> {
  private readonly memoryСache = new Map<number, UserSessionData>();
  constructor(private userService: UserService) {}

  read(key: string): SessionData | undefined {
    const telegramId = parseInt(key);
    const cachedUser = this.memoryСache.get(telegramId);
    if (cachedUser) return cachedUser;

    const user = this.userService.getUserById(telegramId);
    if (!user) return undefined;

    const data: UserSessionData = {
      telegramId: user.telegramId,
      step: 'start',
      __language_code: user.locale,
    };
    this.memoryСache.set(telegramId, data);
    return data;
  }
  write(key: string, value: SessionData): void {
    const telegramId = parseInt(key);
    const memoryUser = this.memoryСache.get(telegramId);
    if (memoryUser?.__language_code !== value.__language_code) {
      this.userService.updateUser(telegramId, {
        locale: value.__language_code,
      });
    }
    this.memoryСache.set(telegramId, {
      telegramId,
      step: value?.step ?? 'start',
      __language_code: value.__language_code || defaultLocale,
    });
  }

  delete(key: string): void {
    // Опционально: можно очистить локаль
    const telegramId = parseInt(key);
    this.memoryСache.delete(telegramId);
    this.userService.updateUser(telegramId, { locale: defaultLocale });
  }
}
