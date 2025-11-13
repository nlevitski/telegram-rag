import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, session } from 'grammy';
import { I18n } from '@grammyjs/i18n';
import { SessionStorageAdapter } from '../adapters/session-storage.adapter';
import { MyContext } from '../types/session';
import { ConversationManager } from '../conversation/converstion.service';
import { conversations, createConversation } from '@grammyjs/conversations';

@Injectable()
export class MiddlewareService implements OnModuleInit {
  constructor(
    private readonly bot: Bot<MyContext>,
    @Inject('GRAMMY_I18N') private readonly i18n: I18n<MyContext>,
    private readonly sessionStorage: SessionStorageAdapter,
    private readonly conversationManager: ConversationManager,
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
    this.bot.use(conversations());
    this.bot.use(createConversation(this.conversationManager.education));
  }
}
