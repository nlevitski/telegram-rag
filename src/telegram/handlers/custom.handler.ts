import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { MyContext } from '../types/session';
import { LlmService } from '../../llm/llm.service';
import { QdrantService } from '../../qdrant/qdrant.service';
import {
  convertMarkdownToTelegramHtml,
  escapeHtml,
} from '../utils/telegram-html';

@Injectable()
export class CustomMessageHandler implements OnModuleInit {
  private readonly logger = new Logger(CustomMessageHandler.name);
  // List of known button texts that should NOT trigger RAG
  private readonly knownButtons = [
    '🤖 About Qubic',
    '🤖 О Qubic',
    '🤝 Community',
    '🤝 Сообщество',
    '❓ Help',
    '❓ Помощь',
    '⛏️ Mining',
    '⛏️ Майнинг',
    '💰 Price & Market',
    '💰 Цена и рынок',
    '🛠️ Settings',
    '🛠️ Настройки',
    '🌍 Language',
    '🌍 Язык',
    '⚡️ Technology',
    '⚡️ Технологии',
    '🎓 Education',
    '🎓 Обучение',
    '🔐 NFT',
    '✅ Done',
    '✅ Готово',
    '↩ Back',
    '↩ Назад',
    '🇬🇧 English',
    '🇬🇧 Английский',
    '🇷🇺 Russian',
    '🇷🇺 Русский',
    '🌀 Ask any question',
    '🌀 Задать произвольный вопрос',
    '⬅️ Back',
    '⬅️ Назад',
    '➡️ Next',
    '➡️ Далее',
  ];

  constructor(
    private readonly bot: Bot<MyContext>,
    private readonly llmService: LlmService,
    private readonly qdrantService: QdrantService,
  ) {}
  onModuleInit() {
    this.bot.on('message:text', this.customMessageHandler);
  }

  private customMessageHandler = async (ctx: MyContext) => {
    const query = ctx.message?.text || '';
    if (!query) return;

    // Skip if it's a command (starts with /)
    if (query.startsWith('/')) {
      return;
    }

    // Skip if it's a known button
    if (this.knownButtons.includes(query)) {
      return;
    }

    // Notify user we are thinking (optional, but good UX)
    await ctx.replyWithChatAction('typing');

    let searchingMsg: { message_id: number } | undefined;

    try {
      // 0. Detect locale (prefer user-selected i18n locale, fallback to Telegram language_code)
      const i18nLocale = await ctx.i18n.getLocale();
      const rawLocale = i18nLocale || ctx.from?.language_code || 'en';
      const locale = rawLocale.startsWith('ru') ? 'ru' : 'en';

      // 0.1. Send "searching" placeholder message
      const searchingText = ctx.t('searching');
      const searchingHtml = convertMarkdownToTelegramHtml(
        searchingText,
        this.logger,
      );
      searchingMsg = await ctx.reply(searchingHtml, { parse_mode: 'HTML' });

      // 1. Expand query for better retrieval (Qubic -> Qubic $QUBIC)
      const searchQuery = query.replace(/\bqubic\b/gi, 'Qubic $QUBIC');

      // 2. Search in Qdrant (threshold 0.01 = 1%) with filter
      const searchResults = await this.qdrantService.search(
        searchQuery,
        5,
        0.01,
        {
          key: 'language',
          match: { value: locale },
        },
      );

      // 2. Prepare context
      // 2. Prepare context with Window Retrieval (fetch next chunk)
      const contextParts: string[] = [];

      for (const res of searchResults) {
        if (!res.payload) continue;

        let content = res.payload.content as string;
        const filename = res.payload.filename as string;
        const chunkIndex = res.payload.chunk_index as number;

        // Try to fetch next chunk to expand context
        if (filename && typeof chunkIndex === 'number') {
          try {
            const nextChunk = await this.qdrantService.getChunk(
              filename,
              chunkIndex + 1,
            );
            if (nextChunk && nextChunk.payload) {
              content += `\n\n(Continued...)\n${nextChunk.payload.content}`;
            }
          } catch (e) {
            console.error(`Failed to fetch next chunk for ${filename}:`, e);
          }
        }

        contextParts.push(content);
      }

      const context = contextParts.join('\n\n---\n\n');

      // 3. Ask LLM
      const answer = await this.llmService.generateAnswer(
        query,
        context,
        locale,
      );

      // 4. Extract sources with scores
      const sourceMap = new Map<string, number>();

      searchResults.forEach((res: any) => {
        const name = res.payload?.source || res.payload?.filename;

        if (name) {
          const score = res.score;
          // Keep the highest score for this filename
          if (!sourceMap.has(name) || score > sourceMap.get(name)!) {
            sourceMap.set(name, score);
          }
        }
      });

      const convertedAnswer = convertMarkdownToTelegramHtml(
        answer,
        this.logger,
      );

      let finalResponse = convertedAnswer;
      if (sourceMap.size > 0) {
        // Prepare localized header
        const headerRaw = locale === 'ru' ? '📚 Источники:' : '📚 Sources:';
        // Header is bold: <b>Header</b>
        const header = `<b>${escapeHtml(headerRaw)}</b>`;

        // Append header
        finalResponse += `\n\n${header}\n`;

        sourceMap.forEach((score, name) => {
          const percent = Math.round(score * 100);

          const escapedName = escapeHtml(name);
          const escapedPercent = escapeHtml(`(${percent}%)`);

          // Using monospace for filename: <code>name</code>
          finalResponse += `• <code>${escapedName}</code> ${escapedPercent}\n`;
        });
      }

      // 5. Reply (edit placeholder)
      try {
        if (ctx.chat?.id && searchingMsg?.message_id) {
          await ctx.api.editMessageText(
            ctx.chat.id,
            searchingMsg.message_id,
            finalResponse,
            { parse_mode: 'HTML' },
          );
        } else {
          await ctx.reply(finalResponse, { parse_mode: 'HTML' });
        }
      } catch (sendError) {
        console.warn(
          'Failed to send with HTML, retrying as plain text...',
          sendError.message,
        );
        if (ctx.chat?.id && searchingMsg?.message_id) {
          await ctx.api.editMessageText(
            ctx.chat.id,
            searchingMsg.message_id,
            finalResponse,
          );
        } else {
          await ctx.reply(finalResponse);
        }
      }
    } catch (error) {
      console.error('Error in RAG handler:', error);
      const fallbackText =
        'Sorry, I encountered an error while processing your request.';
      const fallbackHtml = convertMarkdownToTelegramHtml(
        fallbackText,
        this.logger,
      );
      if (ctx.chat?.id && searchingMsg?.message_id) {
        await ctx.api.editMessageText(
          ctx.chat.id,
          searchingMsg.message_id,
          fallbackHtml,
          { parse_mode: 'HTML' },
        );
      } else {
        await ctx.reply(fallbackHtml, { parse_mode: 'HTML' });
      }
    }
  };
}
