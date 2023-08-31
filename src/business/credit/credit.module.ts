import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Credit, CreditSchema } from './credit.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }])],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
