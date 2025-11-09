import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, session } from 'grammy';
import { I18n } from '@grammyjs/i18n';
import { SessionStorageAdapter } from '../adapters/session-storage.adapter';
import { MyContext } from '../types/session';

@Injectable()
export class MiddlewareService implements OnModuleInit {
  constructor(
    private readonly bot: Bot<MyContext>,
    // private readonly userService: UserService,
    @Inject('GRAMMY_I18N') private readonly i18n: I18n<MyContext>,
    private readonly sessionStorage: SessionStorageAdapter,
  ) {}
  onModuleInit() {
    this.setupSession();
    this.setupMiddlewares();
  }
  private setupSession() {
    this.bot.use(
      session({ initial: () => ({}), storage: this.sessionStorage }),
    );
  }
  private setupMiddlewares() {
    this.bot.use(this.i18n);
  }

  // private userSessionMiddleware() {
  //   return async (ctx: MyContext, next: () => Promise<void>) => {
  //     if (!ctx.from) {
  //       await next();
  //       return;
  //     }
  //     if (!ctx.session.telegramId) {
  //       const user = this.userService.findOrCreateUser(ctx.from);

  //       ctx.session.telegramId = user.telegramId;
  //       ctx.session.locale = user.locale;
  //       ctx.session.step = 'main_menu';
  //     }
  //     console.log('ctx.session----->: ', ctx.session);
  //     await next();
  //   };
  // }
}
