import { DocumentLoader } from './../../document-loader/document-loader.service';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, session } from 'grammy';
import { I18n } from '@grammyjs/i18n';
import { SessionStorageAdapter } from '../adapters/session-storage.adapter';
import { MyContext, MyConversation } from '../types/session';
// import { ConversationManager } from '../conversation/converstion.service';
import { conversations, createConversation } from '@grammyjs/conversations';
import { KeyboardManager } from '../keybords/keyboard.service';

@Injectable()
export class MiddlewareService implements OnModuleInit {
  constructor(
    private readonly bot: Bot<MyContext>,
    @Inject('GRAMMY_I18N') private readonly i18n: I18n<MyContext>,
    private readonly sessionStorage: SessionStorageAdapter,
    private readonly keyboardManager: KeyboardManager,
    private readonly documentLoader: DocumentLoader,
    // private readonly conversationManager: ConversationManager,
  ) {}
  onModuleInit() {
    this.setupSession();
    this.setupMiddlewares();
  }
  private setupSession() {
    this.bot.use(
      session({
        initial: () => ({}),
        storage: this.sessionStorage,
        getSessionKey: (ctx) => {
          if (!ctx?.from?.id) return undefined;
          return ctx.from.id.toString();
        },
      }),
    );
  }
  private setupMiddlewares() {
    this.bot.use(this.i18n);
    this.bot.use(conversations());
    this.bot.use(createConversation(this.education));
  }
  // private dialog = async (conversation: MyConversation, ctx: MyContext) => {
  //   // const locale = await conversation.external((ctx) => ctx.t('back'));

  //   return await this.dialogHandle(conversation, ctx, {
  //     step: 1,
  //     totalSteps: 6,
  //   });
  // };
  // private dialogHandle = async (
  //   conversation: MyConversation,
  //   ctx: MyContext,
  //   options: { step: number; totalSteps: number; locale?: string },
  // ) => {
  //   if (options.step === 1) {
  //     const document = this.documentLoader.getDocumentContent(
  //       `lessons/lesson_${options.step}`,
  //       'ru',
  //     );
  //     await ctx.reply(document);
  //   } else if (options.step < options.totalSteps) {
  //     const document = this.documentLoader.getDocumentContent(
  //       `lessons/lesson_${options.step}`,
  //       'ru',
  //     );
  //     await ctx.reply(document);
  //   } else if (options.step === options.totalSteps) {
  //     const document = this.documentLoader.getDocumentContent(
  //       `lessons/lesson_${options.step}`,
  //       'ru',
  //     );
  //     await ctx.reply(document);
  //     // await conversation.skip();
  //     return;
  //   }
  //   const response = await conversation.wait();
  //   if (!response.message?.text) {
  //     await this.dialogHandle(conversation, ctx, options);
  //     return;
  //   }
  //   await this.dialogHandle(conversation, ctx, {
  //     step: options.step + 1,
  //     totalSteps: options.totalSteps,
  //   });
  //   return;
  // };
  private handleStep = async (
    conversations: MyConversation,
    ctx: MyContext,
    options: {
      step: number;
      totalSteps: number;
    },
  ) => {
    const locale = await conversations.external((ctx) => ctx.i18n.getLocale());
    const document = this.documentLoader.getDocumentContent(
      `lessons/lesson_${options.step}`,
      locale,
    );
    const { back, next, done } = await conversations.external((ctx) => ({
      back: ctx.t('back'),
      next: ctx.t('next'),
      done: ctx.t('done'),
    }));
    const { startKeyboard, processKeyboard, endKeyboard } =
      await conversations.external((ctx) => ({
        startKeyboard: this.keyboardManager.getConversationStart(ctx),
        processKeyboard: this.keyboardManager.getConversationProcess(ctx),
        endKeyboard: this.keyboardManager.getConversationEnd(ctx),
      }));

    if (options.step === 1) {
      await ctx.reply(document, { reply_markup: startKeyboard });
    } else if (options.step < options.totalSteps) {
      await ctx.reply(document, { reply_markup: processKeyboard });
    } else if (options.step === options.totalSteps) {
      await ctx.reply(document, { reply_markup: endKeyboard });
    }

    const { message } = await conversations.waitFor('message:text');
    if (options.step === 1) {
      if (message.text === back) {
        return;
      } else if (message.text === next) {
        options.step += 1;
        await this.handleStep(conversations, ctx, options);
        return;
      }
    } else if (options.step < options.totalSteps) {
      if (message.text === back) {
        options.step -= 1;
        await this.handleStep(conversations, ctx, options);
        return;
      } else if (message.text === next) {
        options.step += 1;
        await this.handleStep(conversations, ctx, options);
        return;
      }
    } else if (options.step === options.totalSteps) {
      if (message.text === back) {
        options.step -= 1;
        await this.handleStep(conversations, ctx, options);
        return;
      } else if (message.text === done) {
        return;
      }
    }

    // const keyboard = await conversations.external(() => {
    //   if (step === 1) {
    //     return this.keyboardManager.getConversationStart(ctx);
    //   } else if (step < totalSteps) {
    //     return this.keyboardManager.getConversationProcess(ctx);
    //   } else {
    //     return this.keyboardManager.getConversationEnd(ctx);
    //   }
    // });
    // await ctx.reply(document, { reply_markup: keyboard });
    // const response = await conversations.wait();

    // if (!response.message?.text) {
    //   await this.handleStep(conversations, ctx, {
    //     step,
    //     totalSteps,
    //     locale,
    //     next,
    //     back,
    //     done,
    //   });
    //   return;
    // }

    // const buttonText = response.message.text;
    // if (buttonText === back) {
    //   if (step === 1) {
    //     await ctx.reply('back to main menu', {
    //       reply_markup: { remove_keyboard: true },
    //     });
    //   } else {
    //     await this.handleStep(conversations, ctx, {
    //       step: step - 1,
    //       totalSteps,
    //       locale,
    //       next,
    //       back,
    //       done,
    //     });
    //   }
    //   return;
    // } else if (buttonText === next) {
    //   if (step < totalSteps) {
    //     await this.handleStep(conversations, ctx, {
    //       step: step + 1,
    //       totalSteps,
    //       locale,
    //       next,
    //       back,
    //       done,
    //     });
    //   } else {
    //     await this.handleStep(conversations, ctx, {
    //       step,
    //       totalSteps,
    //       locale,
    //       next,
    //       back,
    //       done,
    //     });
    //   }
    //   return;
    // } else if (buttonText === done) {
    //   await ctx.reply('done!', { reply_markup: { remove_keyboard: true } });
    //   return;
    // } else {
    //   await this.handleStep(conversations, ctx, {
    //     step,
    //     totalSteps,
    //     locale,
    //     next,
    //     back,
    //     done,
    //   });
    //   return;
    // }
  };

  private education = async (conversation: MyConversation, ctx: MyContext) => {
    // const locale = await conversation.external(async () =>
    //   ctx.i18n.getLocale(),
    // );
    // const { next, back, done } = await conversation.external(() => ({
    //   next: ctx.t('next'),
    //   back: ctx.t('back'),
    //   done: ctx.t('done'),
    // }));
    await this.handleStep(conversation, ctx, {
      step: 1,
      totalSteps: 6,
    });
    // const translations = await conversation.external(() => ({
    //   back: ctx1.t('back'),
    //   next: ctx1.t('next'),
    //   done: ctx1.t('done'),
    //   returnToMainMenu: ctx1.t('return_to_main_menu'),
    //   doneEducation: ctx1.t('done_education'),
    //   useNavButtons: ctx1.t('use_nav_buttons'),
    // }));
    // const keyboardStart = await conversation.external(() =>
    //   this.keyboardManager.getConversationStart(ctx1),
    // );
    // const document1 = await conversation.external(() =>
    //   this.documentLoader.getDocumentContent(`lessons/lesson_1`, currentLocale),
    // );
    // await ctx1.reply(document1, { reply_markup: keyboardStart });
    // const ctx2 = await conversation.wait();

    // while (true) {
    //   const keyboard = await conversation.external(() => {
    //     return step === 1
    //       ? this.keyboardManager.getConversationStart(ctx)
    //       : this.keyboardManager.getConversationEnd(ctx);
    //   });

    //   const document = this.documentLoader.getDocumentContent(
    //     `lessons/lesson_${step}`,
    //     currentLocale,
    //   );
    //   await ctx.reply(document, {
    //     reply_markup: keyboard,
    //   });
    //   const { message } = await conversation.wait();
    //   const text = message?.text;
    //   if (text === translations.back) {
    //     if (step === 1) {
    //       const mainMenuKeyboard = await conversation.external(() => {
    //         return this.keyboardManager.getMainMenu(ctx);
    //       });
    //       await ctx.reply(translations.returnToMainMenu, {
    //         reply_markup: mainMenuKeyboard,
    //       });
    //       return;
    //     }
    //     step -= 1;
    //   } else if (text === translations.next && step < totalSteps) {
    //     step += 1;
    //   } else if (text === translations.done && step === totalSteps) {
    //     const mainMenuKeyboard = await conversation.external((ctx) => {
    //       return this.keyboardManager.getMainMenu(ctx);
    //     });
    //     await ctx.reply(translations.doneEducation, {
    //       reply_markup: mainMenuKeyboard,
    //     });
    //     break;
    //   } else {
    //     await ctx.reply(translations.useNavButtons);
    //   }
    // }
  };
}
