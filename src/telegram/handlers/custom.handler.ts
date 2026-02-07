import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { MyContext } from '../types/session';
import { LlmService } from '../../llm/llm.service';
import { QdrantService } from '../../qdrant/qdrant.service';

@Injectable()
export class CustomMessageHandler implements OnModuleInit {
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

    try {
      // 0. Detect locale (prefer user-selected i18n locale, fallback to Telegram language_code)
      const i18nLocale = await ctx.i18n.getLocale();
      const rawLocale = i18nLocale || ctx.from?.language_code || 'en';
      const locale = rawLocale.startsWith('ru') ? 'ru' : 'en';

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
        const name = res.payload?.filename;

        if (name) {
          const score = res.score;
          // Keep the highest score for this filename
          if (!sourceMap.has(name) || score > sourceMap.get(name)!) {
            sourceMap.set(name, score);
          }
        }
      });

      let finalResponse = answer;
      if (sourceMap.size > 0) {
        // Prepare localized header
        const headerRaw = locale === 'ru' ? '📚 Источники:' : '📚 Sources:';
        // Header is bold: <b>Header</b>
        const header = `<b>${this.escapeHtml(headerRaw)}</b>`;

        // Append header
        finalResponse += `\n\n${header}\n`;

        sourceMap.forEach((score, name) => {
          const percent = Math.round(score * 100);

          const escapedName = this.escapeHtml(name);
          const escapedPercent = this.escapeHtml(`(${percent}%)`);

          // Using monospace for filename: <code>name</code>
          finalResponse += `• <code>${escapedName}</code> ${escapedPercent}\n`;
        });
      }

      // 5. Reply
      try {
        await ctx.reply(finalResponse, { parse_mode: 'HTML' });
      } catch (sendError) {
        console.warn(
          'Failed to send with HTML, retrying as plain text...',
          sendError.message,
        );
        await ctx.reply(finalResponse);
      }
    } catch (error) {
      console.error('Error in RAG handler:', error);
      await ctx.reply(
        'Sorry, I encountered an error while processing your request.',
      );
    }
  };

  // Helper to escape HTML special chars
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
