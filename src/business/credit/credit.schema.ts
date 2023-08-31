import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { format } from 'date-fns';

export type CreditDocument = HydratedDocument<Credit>;

@Schema()
export class Credit {
  @Prop()
  chat_id: number;

  @Prop()
  message_id: number;

  @Prop()
  from_user_id: number;

  @Prop()
  to_user_id: number;

  @Prop()
  score: number;

  @Prop()
  type: string;

  @Prop({ default: () => +format(new Date(), 'yyyyMMdd') })
  on_date: number;
}

export const CreditSchema = SchemaFactory.createForClass(Credit);