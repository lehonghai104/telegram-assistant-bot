import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GitHubRepositoryDocument = HydratedDocument<GitHubRepository>;

@Schema()
export class GitHubRepository {
  @Prop()
  owner: string;

  @Prop()
  name: string;

  @Prop()
  tag_name: string;

  @Prop()
  published_at: string;

  @Prop({ type: [Number], required: true, default: () => [] })
  chatIds: number[];
}

export const GitHubRepositorySchema = SchemaFactory.createForClass(GitHubRepository);