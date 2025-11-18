// import { MyContext } from 'src/telegram/types/session';
// import { MyConversation } from './../types/session';
// import { Injectable } from '@nestjs/common';
// import { DocumentLoader } from 'src/document-loader/document-loader.service';
// import { KeyboardManager } from '../keybords/keyboard.service';

// @Injectable()
// export class ConversationManager {
//   constructor(
//     private readonly documentLoader: DocumentLoader,
//     private readonly keyboardManager: KeyboardManager,
//   ) {}
//   public education = async (conversation: MyConversation, ctx: MyContext) => {
//     const totalSteps = 6;
//     let step = 1;
//     const currentLocale = await ctx.i18n.getLocale();
//     while (true) {
//       const keyboard = await conversation.external(() => {
//         return step === 1
//           ? this.keyboardManager.getConversationStart(ctx)
//           : this.keyboardManager.getConversationEnd(ctx);
//       });

//       const translations = await conversation.external(() => ({
//         back: ctx.t('back'),
//         next: ctx.t('next'),
//         done: ctx.t('done'),
//         returnToMainMenu: ctx.t('return_to_main_menu'),
//         doneEducation: ctx.t('done_education'),
//         useNavButtons: ctx.t('use_nav_buttons'),
//       }));

//       const document = this.documentLoader.getDocumentContent(
//         `lessons/lesson_${step}`,
//         currentLocale,
//       );
//       await ctx.reply(document, {
//         reply_markup: keyboard,
//       });
//       const { message } = await conversation.wait();
//       const text = message?.text;
//       if (text === translations.back) {
//         if (step === 1) {
//           const mainMenuKeyboard = await conversation.external(() => {
//             return this.keyboardManager.getMainMenu(ctx);
//           });
//           await ctx.reply(translations.returnToMainMenu, {
//             reply_markup: mainMenuKeyboard,
//           });
//           return;
//         }
//         step -= 1;
//       } else if (text === translations.next && step < totalSteps) {
//         step += 1;
//       } else if (text === translations.done && step === totalSteps) {
//         const mainMenuKeyboard = await conversation.external((ctx) => {
//           return this.keyboardManager.getMainMenu(ctx);
//         });
//         await ctx.reply(translations.doneEducation, {
//           reply_markup: mainMenuKeyboard,
//         });
//         break;
//       } else {
//         await ctx.reply(translations.useNavButtons);
//       }
//     }
//   };
// }
