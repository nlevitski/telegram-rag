import { MyContext } from 'src/telegram/types/session';
import { MyConversation } from './../types/session';
import { Injectable } from '@nestjs/common';
import { DocumentLoader } from 'src/document-loader/document-loader.service';
import { KeyboardManager } from '../keybords/keyboard.service';

@Injectable()
export class ConversationManager {
  constructor(
    private readonly documentLoader: DocumentLoader,
    private readonly keyboardManager: KeyboardManager,
  ) {}
  public education = async (conversation: MyConversation, ctx: MyContext) => {
    const totalSteps = 6;
    let step = 1;
    while (true) {
      const keyboard =
        step === 1
          ? this.keyboardManager.getConversationStart(ctx)
          : this.keyboardManager.getConversationEnd(ctx);
      const currentLocale = await ctx.i18n.getLocale();
      const document = this.documentLoader.getDocumentContent(
        `lessons/lesson_${step}`,
        currentLocale,
      );
      await ctx.reply(document, {
        reply_markup: keyboard,
      });
      const { message } = await conversation.wait();
      const text = message?.text;
      if (text === ctx.t('back')) {
        if (step === 1) {
          return await ctx.reply(ctx.t('return_to_main_menu'), {
            reply_markup: this.keyboardManager.getMainMenu(ctx),
          });
        }
        step -= 1;
      } else if (text === ctx.t('next') && step < totalSteps) {
        step += 1;
      } else if (text === ctx.t('done') && step === totalSteps) {
        await ctx.reply(ctx.t('done_education'), {
          reply_markup: this.keyboardManager.getMainMenu(ctx),
        });
      } else {
        await ctx.reply(ctx.t('use_nav_buttons'));
      }
    }
  };
}
