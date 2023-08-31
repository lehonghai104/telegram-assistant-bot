import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { Module } from '@nestjs/common';

export const TELEGRAM_BOT = 'TELEGRAM_BOT';

export const TelegramBotProvider = {
  provide: TELEGRAM_BOT,
  useFactory: async (configService: ConfigService) => {
    const token = configService.getOrThrow('TELEGRAM_BOT_TOKEN');
    return new TelegramBot(token, { polling: true });
  },
  inject: [ConfigService],
}

@Module({
  providers: [
    TelegramBotProvider,
  ],
  exports: [
    TelegramBotProvider,
  ]
})
export class TelegramModule {}
