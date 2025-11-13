// import { Conversation, ConversationFlavor } from '@grammyjs/conversations';

// const TOTAL_STEPS = 6;

// export async function educationConversation(
//   conversation: MyConversation,
//   ctx: MyContext,
// ) {
//   let step = 1;

//   while (true) {
//     const keyboard =
//       step === 1 ? km.getConversationStart(ctx) : km.getConversationEnd(ctx);
//     const content = dl.getDocumentContent(`lessons/lesson_${step}`, locale);
//     await ctx.reply(`📚 Шаг ${step} из ${TOTAL_STEPS}`, {
//       reply_markup: keyboard,
//     });

//     const { message } = await conversation.wait();
//     const text = message?.text;

//     if (text === 'Back') {
//       if (step === 1) {
//         await ctx.reply('🔙 Возврат в главное меню', {
//           reply_markup: {
//             keyboard: [[{ text: 'Education' }]],
//             resize_keyboard: true,
//           },
//         });
//         return; // Выходим из диалога
//       }
//       step--;
//     } else if (text === 'Next' && step < TOTAL_STEPS) {
//       step++;
//     } else if (text === 'Done') {
//       await ctx.reply('✅ Обучение завершено. Возврат в главное меню.', {
//         reply_markup: {
//           keyboard: [[{ text: 'Education' }]],
//           resize_keyboard: true,
//         },
//       });
//       return;
//     } else {
//       await ctx.reply('Используй кнопки навигации ⬇️');
//     }
//   }
// }
