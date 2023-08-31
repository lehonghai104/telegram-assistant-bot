import { TelegramModule } from '@core/telegram';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { CreditModule } from './business/credit/credit.module';
import { GitHubMonitorModule } from './business/github-monitor/github-monitor.module';
import { OpenAIModule } from './business/openai/openai.module';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    CreditModule,
    OpenAIModule,
    GitHubMonitorModule,
    TelegramModule,
  ],
  providers: [
    TelegramBotService,
  ]
})
export class AppModule { }
