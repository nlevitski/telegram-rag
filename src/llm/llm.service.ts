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
Use the following pieces of context to answer the user's question. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Note: "Qubic" and "$QUBIC" are interchangeable terms referring to the same project and token.

IMPORTANT FORMATTING RULE:
- Format your entire response in Telegram HTML style.
- Use <b>bold</b> for bold text.
- Use <i>italic</i> for italic text.
- Use <a href="URL">text</a> for links.
- Use <code>code</code> for inline code.
- Do NOT use Markdown characters like * or _.
- Example: "You can buy it on <a href="https://gate.io">Gate.io</a> or use the <code>$QUBIC</code> token."

Answer in ${languageName}.

Context:
${context}`,
      ),
      new HumanMessage(question),
    ];

    return this.chat(messages);
  }
}
