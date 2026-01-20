import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { OutboxEvent, type OutboxEventDocument } from './outbox.schema';

export type CreateOutboxEventInput = {
  type: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class OutboxService {
  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEventDocument>,
  ) {}

  async enqueue(event: CreateOutboxEventInput): Promise<void> {
    await this.outboxModel.create({
      ...event,
      status: 'PENDING',
      attempts: 0,
    });
  }
}

