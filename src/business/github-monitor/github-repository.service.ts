import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GitHubRepository } from './github-repository.schema';

@Injectable()
export class GitHubRepositoryService {
  private logger = new Logger(this.constructor.name);

  constructor(
    @InjectModel(GitHubRepository.name) private model: Model<GitHubRepository>,
  ) { }

  async addMonitor(owner: string, name: string, chatId: number): Promise<GitHubRepository> {
    let data = await this.model.findOne({ owner, name }).exec();
    if (!data) {
      data = await new this.model({owner, name}).save();
    }
    if (!data.chatIds.includes(chatId)) {
      data.chatIds.push(chatId);
      return data.save();
    }
    return data;
  }

  async update(owner: string, name: string, tag_name: string, published_at: string): Promise<GitHubRepository> {
    return await this.model.findOneAndUpdate({ owner, name }, { tag_name, published_at }).exec();
  }

  async findAll(): Promise<GitHubRepository[]> {
    return this.model.find().exec();
  }
}
