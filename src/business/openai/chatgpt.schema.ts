import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatGPTDocument = HydratedDocument<ChatGPT>;

@Schema()
export class ChatGPT {
  @Prop()
  chat_id: number;

  @Prop()
  conversation_id: number;

  @Prop()
  message_id: number;

  @Prop({ type: 'string' })
  role: 'system' | 'user' | 'assistant' | 'function';

  @Prop()
  content: string;

  @Prop({ default: () => Date.now() })
  created_at: number;
}

export const ChatGPTSchema = SchemaFactory.createForClass(ChatGPT);