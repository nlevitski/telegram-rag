import { StorageAdapter } from 'grammy';
import { SessionData } from '../types/session';
import { UserService } from 'src/db/user.service';
import { Injectable } from '@nestjs/common';

const defaultLocale = 'en';

@Injectable()
export class SessionStorageAdapter implements StorageAdapter<SessionData> {
  constructor(private userService: UserService) {}

  read(key: string): SessionData | undefined {
    const telegramId = parseInt(key);
    const user = this.userService.getUserById(telegramId);
    return user
      ? { telegramId: user.telegramId, __language_code: user.locale }
      : undefined;
  }
  write(key: string, value: SessionData): void {
    const telegramId = parseInt(key);
    this.userService.updateUser(telegramId, {
      locale: value.__language_code,
    });
  }

  delete(key: string): void {
    // Опционально: можно очистить локаль
    const telegramId = parseInt(key);
    this.userService.updateUser(telegramId, { locale: defaultLocale });
  }
}
