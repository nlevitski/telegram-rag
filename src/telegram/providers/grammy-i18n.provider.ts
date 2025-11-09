import { join } from 'path';
import { I18n } from '@grammyjs/i18n';

export const GrammyI18nProvider = {
  provide: 'GRAMMY_I18N',
  useValue: new I18n({
    defaultLocale: 'en',
    useSession: true,
    directory: join(process.cwd(), 'src', 'telegram', 'locales'),
  }),
};
