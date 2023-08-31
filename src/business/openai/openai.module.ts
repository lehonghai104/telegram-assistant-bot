import { Module } from '@nestjs/common';
import { ChatGPTService } from './chatgpt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGPT, ChatGPTSchema } from './chatgpt.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChatGPT.name, schema: ChatGPTSchema }])],
  providers: [ChatGPTService],
  exports: [ChatGPTService],
})
export class OpenAIModule {}
