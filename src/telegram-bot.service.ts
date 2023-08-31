import { TelegramBotProvider } from '@core/telegram';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { CreditService } from './business/credit/credit.service';
import { createId } from '@paralleldrive/cuid2';
import { ChatGPTService } from './business/openai/chatgpt.service';
import { GitHubRepositoryService } from './business/github-monitor/github-repository.service';
import { GitHubReleaseService } from './business/github-monitor/github-release.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private logger = new Logger(this.constructor.name);

  constructor(
    @Inject(TelegramBotProvider.provide)
    private bot: TelegramBot,
    private creditService: CreditService,
    private chatGPTService: ChatGPTService,
    private githubRepositoryService: GitHubRepositoryService,
    private githubReleaseService: GitHubReleaseService,
  ) { }

  onModuleInit() {
    this.bot.on('message', this.onMessage.bind(this));
  }

  async onMessage(message: TelegramBot.Message, _metadata: TelegramBot.Metadata) {
    const logId = createId();
    this.logger.log(`${logId}: Receive message: ${JSON.stringify(message)}`)
    try {
      if (message.text?.startsWith('/top')) return await this.onCommandTopCredit(message);
      if (message.text?.startsWith('/ask')) return await this.chatGPTService.ask(message, this.bot);
      if (message.text?.startsWith('/github list')) return await this.onGitHubList(message);
      if (message.text?.startsWith('/github add')) return await this.onGitHubAdd(message);
      if (message.reply_to_message && (message.text?.startsWith('+') || message.text?.startsWith('-'))) return await this.onCredit(message);
    } catch (error) {
      this.logger.debug(`${logId}: Error when trying to handle message`);
      this.logger.error(error, error.stack);
    }
  }

  async onCredit(message: TelegramBot.Message) {
    const chat_id = message.chat.id;
    const message_id = message.message_id;
    const from_user_id = message.from.id;
    const to_user_id = message.reply_to_message.from.id;
    const type = message.text[0];
    const count = await this.creditService.countTodayCredit(chat_id, from_user_id, to_user_id, type );
    const score = (type === '+' ? 1 : -1)/(2**count);
    await this.creditService.create({ chat_id, message_id, from_user_id, to_user_id, score, type });
  }

  async onCommandTopCredit(message: TelegramBot.Message) {
    const chat_id = message.chat.id;
    const credits = await this.creditService.getTopCredit(chat_id);
    if (credits.length === 0) return;

    credits.sort((u1, u2) => u2.total_score - u1.total_score);
    const topCredits = (await Promise.all(credits.map(async (credit, index) => {
      const member = await this.bot.getChatMember(message.chat.id, credit.user_id);
      let memberName = member.user.username ?? member.user.first_name;
      if (member.user.last_name) memberName += ` ${member.user.last_name}`;
      return `${index + 1}. ${memberName}: ${Math.round(credit.total_score*1000)/1000} score(s)`;
    }))).join('\n');

    await this.bot.sendMessage(message.chat.id, topCredits, { reply_to_message_id: message.message_id });
  }

  async onGitHubList(message: TelegramBot.Message) {
    let text = 'No repository!';
    const repos = (await this.githubRepositoryService.findAll()).filter(repo => repo.chatIds?.includes(message.chat.id));
    if (repos?.length > 0) {
      text = `Here is a list of repositories whose releases we are monitoring:\n\n`
      text += repos.map(repo => `[${repo.owner}/${repo.name} v${repo.tag_name}](https://github.com/${repo.owner}/${repo.name}/releases/tag/${repo.tag_name})`).join('\n')
    }
    return await this.bot.sendMessage(message.chat.id, text, { reply_to_message_id: message.message_id });
  }

  async onGitHubAdd(message: TelegramBot.Message) {
    const [owner, name, ..._] = message.text.replace('/github add', '').replace('https://github.com/', '').trim().split('/');
    const release = await this.githubReleaseService.getReleaseInfo(message.message_id.toString(), owner, name);
    const text = 'Repo not found!';

    if ((release?.status ?? 404) != 404) {
      const repo = await this.githubRepositoryService.addMonitor(owner, name, message.chat.id);
      await this.githubReleaseService.updateRepo(message.message_id.toString(), repo);
    }

    return await this.bot.sendMessage(message.chat.id, text, { reply_to_message_id: message.message_id });
  }
}
