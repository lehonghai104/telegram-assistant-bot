import { TelegramModule } from '@core/telegram';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitHubReleaseService } from './github-release.service';
import { GitHubRepository, GitHubRepositorySchema } from './github-repository.schema';
import { GitHubRepositoryService } from './github-repository.service';
import { GitHubRepositoriesController } from './controllers/github-repositories.controller';

@Module({
  controllers: [GitHubRepositoriesController],
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: GitHubRepository.name, schema: GitHubRepositorySchema }]),
    TelegramModule,
  ],
  providers: [GitHubReleaseService, GitHubRepositoryService],
  exports: [GitHubReleaseService, GitHubRepositoryService],
})
export class GitHubMonitorModule {}
