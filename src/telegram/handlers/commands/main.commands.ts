import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { DrizzleDB } from 'src/db/drizzle.provider';

import { telegramUsers } from 'src/db/drizzle/schema';
import { DocumentLoader } from 'src/document-loader/document-loader.service';
// import { DocumentCommandFactory } from './document.command';

@Injectable()
export class MainCommandsService implements OnModuleInit {
  private readonly logger = new Logger(MainCommandsService.name);

  constructor(
    private readonly bot: Bot<Context>,
    private readonly documentLoader: DocumentLoader,
    @Inject(DrizzleDB) private readonly db: DrizzleDB,
    // private readonly documentCommandFactory: DocumentCommandFactory,
  ) {}

  onModuleInit() {
    // Инициализируем все команды
    // this.commands = [...this.documentCommandFactory.createCommands()];

    // Регистрируем команды в боте
    this.commandRegister();

    // Устанавливаем команды в меню бота
    // await this.setBotCommands();

    // this.logger.log(`✅ Registered ${this.commands.length} commands`);
  }

  private commandRegister() {
    this.bot.command('start', this.startCommand);
    this.bot.command('help', this.helpCommand);
    this.bot.command('settings', this.settingsCommand);
    this.bot.command('technology', this.technologyCommand);
    this.bot.command('mining', this.miningCommand);
    this.bot.command('priceandmarket', this.priceAndMarketCommand);
    this.bot.command('about', this.aboutCommand);
    this.bot.command('community', this.communityCommand);
  }

  private startCommand = async (ctx: Context) => {
    await ctx.reply('start');
  };
  private helpCommand = async (ctx: Context) => {
    const result = this.db.select().from(telegramUsers).all();
    console.log('result: ', result);
    await ctx.reply('help');
  };
  private settingsCommand = async (ctx: Context) => {
    await ctx.reply('settings');
  };

  private aboutCommand = async (ctx: Context) => {
    const result = this.documentLoader.getDocumentContent('commands/about');
    await ctx.reply(result || 'content non found');
  };
  private priceAndMarketCommand = async (ctx: Context) => {
    const content = this.documentLoader.getDocumentContent(
      'commands/price_and_market',
    );
    await ctx.reply(content);
  };
  private technologyCommand = async (ctx: Context) => {
    const content = this.documentLoader.getDocumentContent(
      'commands/technology',
    );
    await ctx.reply(content);
  };
  private communityCommand = async (ctx: Context) => {
    const content =
      this.documentLoader.getDocumentContent('commands/community');
    await ctx.reply(content);
  };
  private miningCommand = async (ctx: Context) => {
    const content = this.documentLoader.getDocumentContent('commands/mining');
    await ctx.reply(content);
  };

  // register(bot: Bot<Context>) {
  //   this.commands.forEach((commandInstance) => {
  //     const { command: commandName } = commandInstance.metadata;

  //     // Регистрируем обработчик команды
  //     bot.command(commandName, async (ctx) => {
  //       try {
  //         await commandInstance.executeWithMiddleware(ctx);
  //       } catch (error) {
  //         this.logger.error(`Error executing command /${commandName}:`, error);
  //         await ctx.reply(
  //           '❌ Произошла ошибка при выполнении команды. Попробуйте позже.',
  //         );
  //       }
  //     });
  //   });

  // Добавляем обработчик для неизвестных команд
  // bot.on('message:text', async (ctx) => {
  //   if (ctx.message.text.startsWith('/')) {
  //     await ctx.reply(
  //       '❌ Неизвестная команда. Используйте /help для получения списка доступных команд.',
  //     );
  //   }
  // });
}

// getCommands() {
//   return this.commands.map((command) => ({
//     command: command.metadata.command,
//     description: command.metadata.description || '',
//   }));
// }

// private async setBotCommands() {
//   try {
//     const commands = this.getCommands();
//     await this.bot.api.setMyCommands(commands);
//     this.logger.log('✅ Bot menu commands updated');
//   } catch (error) {
//     this.logger.error('Failed to set bot commands:', error);
//   }
// }

// Вспомогательный метод для получения команды по имени
// getCommand(commandName: string): BaseCommand | undefined {
//   return this.commands.find((cmd) => cmd.metadata.command === commandName);
// }
