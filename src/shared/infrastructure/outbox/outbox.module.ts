import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OutboxEvent, OutboxEventSchema } from './outbox.schema';
import { OutboxProcessor } from './outbox.processor';
import { OutboxService } from './outbox.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: OutboxEvent.name, schema: OutboxEventSchema }])],
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}

