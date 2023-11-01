import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ChatGPT } from './chatgpt.schema';
import { Model } from 'mongoose';
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class ChatGPTService {
  private logger = new Logger(this.constructor.name);
  private openai: OpenAI;

  constructor(
    @InjectModel(ChatGPT.name)
    private model: Model<ChatGPT>,
    configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: configService.getOrThrow('OPENAI_API_KEY'),
    });
  }

  async ask(question: TelegramBot.Message, bot: TelegramBot) {
    const content = question.text.replace('/ask', '').trim();
    const message_id = question.message_id;
    const chat_id = question.chat.id;
    const conversation_message = await this.find_message(question.reply_to_message?.message_id);
    const { conversation_id } = await this.create({
      chat_id,
      content,
      message_id,
      role: 'user',
      conversation_id: conversation_message?.conversation_id ?? message_id
    });

    const messages: ChatCompletionMessageParam[] = (await this.find_conversations(conversation_id))
      .map(({ role, content }) => ({ role, content }));

    let response = '';
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        messages,
      });
      const choice = completion.choices?.[0];
      response = choice.message.content;
      if (response) {
        const res = await bot.sendMessage(
          question.chat.id,
          response,
          { reply_to_message_id: question.message_id, parse_mode: 'Markdown' }
        );
        await this.create({
          chat_id,
          content: response,
          conversation_id,
          role: 'system',
          message_id: res.message_id,
        });
      }
    }
    catch (e) {
      this.logger.error(e, e.stack);
      await bot.sendMessage(
        question.chat.id,
        'Bó tay!',
        { reply_to_message_id: question.message_id }
      );
    }
  }

  async find_message(message_id?: number): Promise<ChatGPT> {
    if (!message_id) return null;
    return this.model.findOne({ message_id });
  }

  async find_conversations(conversation_id: number): Promise<ChatGPT[]> {
    return this.model.find({ conversation_id }).sort('created_at').exec();
  }

  async create(data: Partial<ChatGPT>): Promise<ChatGPT> {
    return (new this.model(data)).save();
  }

}
