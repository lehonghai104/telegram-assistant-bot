import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { GitHubReleaseService } from '../github-release.service';
import { GitHubRepositoryService } from '../github-repository.service';

export class MonitorDto {
  @ApiProperty({
    example: 'microsoft',
  })
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    example: 'vscode',
  })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '841767514',
  })
  @IsOptional()
  chatId: number;
}

@ApiTags('github')
@Controller('/github-monitor/repositories')
export class GitHubRepositoriesController {
  private logger = new Logger(this.constructor.name);
  constructor(
    private readonly githubRepositoryService: GitHubRepositoryService,
    private readonly githubReleaseService: GitHubReleaseService,
  ) { }

  @Post()
  async addMonitor(@Body() body: MonitorDto) {
    const { owner, name, chatId } = body;
    const repo = await this.githubRepositoryService.addMonitor(owner, name, chatId);
    await this.githubReleaseService.updateRepo('api', repo);
    return repo;
  }
}
