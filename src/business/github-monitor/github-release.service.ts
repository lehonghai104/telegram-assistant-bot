import { TelegramBotProvider } from '@core/telegram';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createId } from '@paralleldrive/cuid2';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { GitHubRepositoryService } from './github-repository.service';
import { GitHubRepository } from './github-repository.schema';


export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: any[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

@Injectable()
export class GitHubReleaseService {
  private logger = new Logger(this.constructor.name);
  constructor(
    @Inject(TelegramBotProvider.provide) private bot: TelegramBot,
    private readonly githubRepositoryService: GitHubRepositoryService,
    private readonly httpService: HttpService,
  ) { }

  @Cron('0 0 1,7,13,19 * * *')
  async handleCron() {
    const taskId = createId();
    const repositories = await this.githubRepositoryService.findAll();
    for (const repo of repositories) {
      await this.updateRepo(taskId, repo);
    }
  }

  async updateRepo(taskId: string, repo: GitHubRepository) {
    const { owner, name, chatIds } = repo;
    const logId = `${taskId}:${owner}:${name}`;
    const response = await this.getReleaseInfo(logId, owner, name);
    if ((response.data?.tag_name ?? repo.tag_name) === repo.tag_name) {
      this.logger.debug(`${logId}:${owner}:${name} Nothing new.`);
      return;
    }

    const { tag_name, published_at, html_url, body } = response.data;
    await this.githubRepositoryService.update(owner, name, tag_name, published_at);
    const title = `[${owner}/${name} v${tag_name}](${html_url})`;
    const release = `*${response.data.name}*`;
    const message = `${title}\n${release}\n\n${body}`;
    for (const chatId of chatIds) {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown'});
    }
  }

  async getReleaseInfo(logId: string, owner: string, name: string) {
    return this.send<Release>(logId, {
      url: `https://api.github.com/repos/${owner}/${name}/releases/latest`,
      method: 'GET'
    });
  }

  private send<T>(logId: string, options: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.logger.log(`[${logId}] Send request: ${JSON.stringify(options)}`);
    return firstValueFrom(
      this.httpService.request<T>(options).pipe(
        tap(response => {
          const { data, status } = response;
          this.logger.log(`[${logId}] Receive response [${status}]: ${JSON.stringify(data)}`);
        }),
        catchError(error => {
          if (error.response) {
            const { data, status } = error.response;
            this.logger.error(
              `[${logId}] Error [${status}]: - ${error.message}: ${JSON.stringify(data)}`,
            );
          } else {
            this.logger.error(`[${logId}] Error - ${error.message}`);
          }
          return of(error.response);
        }),
      ),
    );
  }
}
