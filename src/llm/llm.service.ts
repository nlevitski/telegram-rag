import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';

@Injectable()
export class LlmService {
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GLM_API_KEY');
    this.model = new ChatOpenAI({
      modelName: 'GLM-4.7-Flash',
      temperature: 0.7,
      openAIApiKey: apiKey,
      apiKey: apiKey,
      configuration: {
        baseURL: 'https://api.z.ai/api/paas/v4/',
        apiKey: apiKey,
      },
    });
  }

  async chat(messages: BaseMessage[]): Promise<string> {
    const response = await this.model.invoke(messages);
    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
  }

  async generateAnswer(
    question: string,
    context: string,
    language: string = 'en',
  ): Promise<string> {
    const languageName = language === 'ru' ? 'Russian' : 'English';
    const messages = [
      new SystemMessage(
        `You are a helpful assistant for the Qubic ecosystem.
Use only the provided context to answer the user's question.
If the answer is not in the context, reply exactly: не знаю
Do not add any other words or explanations.
Note: "Qubic" and "$QUBIC" are interchangeable terms referring to the same project and token.

IMPORTANT FORMATTING RULES (TELEGRAM HTML ONLY):
- Output must be ONLY HTML, with no extra text around it.
- Allowed tags ONLY: <b>, <i>, <u>, <s>, <a href="...">, <code>, <pre>, <tg-spoiler>
- Do NOT use Markdown or any Markdown symbols like *, _, or \` (including triple backticks).
- Do NOT wrap the response in quotes or code fences.
- Provide a complete, clear sentence or two that fully answers the question (not a single fragment or name alone).

Answer in ${languageName}.

Context:
${context}`,
      ),
      new HumanMessage(question),
    ];

    return this.chat(messages);
  }
}
