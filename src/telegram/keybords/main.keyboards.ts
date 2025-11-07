import { Keyboard } from 'grammy';

export const mainKeyboard = new Keyboard()
  .text('📄 Помощь')
  .text('📬 Поддержка')
  .row()
  .text('⚙️ Настройки')
  .resized();
