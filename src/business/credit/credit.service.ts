import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Credit } from './credit.schema';
import { format } from 'date-fns'

export interface UserCredit {
  user_id: number;
  total_score: number;
}

@Injectable()
export class CreditService {
  constructor(@InjectModel(Credit.name) private creditModel: Model<Credit>) { }

  async create(data: Partial<Credit>): Promise<Credit> {
    const createdCredit = new this.creditModel(data);
    return createdCredit.save();
  }

  async getTopCredit(chat_id: number): Promise<UserCredit[]> {
    const aggregation = [
      { $match: { chat_id } },
      {
        $group: {
          _id: '$to_user_id',
          total_score: { $sum: '$score' },
        },
      },
      {
        $project: {
          _id: 0,
          user_id: '$_id',
          total_score: 1,
        },
      },
      // { $sort: { total_score: -1 } },
      // { $limit: limit },
    ];

    return this.creditModel.aggregate(aggregation).exec();
  }

  async countTodayCredit(chat_id: number, from_user_id: number, to_user_id: number, type: string) {
    return this.creditModel.count({ chat_id, from_user_id, to_user_id, type, on_date: +format(new Date(), 'yyyyMMdd') });
  }

  async findAll(): Promise<Credit[]> {
    return this.creditModel.find().exec();
  }
}