import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { getConfig } from '../../config/get-config';
import { OutboxEvent, type OutboxEventDocument } from './outbox.schema';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessor.name);
  private timer?: NodeJS.Timeout;
  private processing = false;
  private readonly workerId = `${process.pid}`;

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEventDocument>,
  ) {}

  onModuleInit() {
    const config = getConfig();
    this.timer = setInterval(() => void this.tick(), config.outboxPollIntervalMs);
    this.logger.log(`Outbox processor started (poll=${config.outboxPollIntervalMs}ms)`);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      for (let i = 0; i < 100; i++) {
        const evt = await this.claimNext();
        if (!evt) break;
        try {
          this.logger.log(
            `OUTBOX ${evt.type} ${evt.aggregateType}/${evt.aggregateId} payload=${JSON.stringify(
              evt.payload,
            )}`,
          );
          await this.outboxModel.updateOne(
            { _id: evt._id },
            { $set: { status: 'PROCESSED', processedAt: new Date() } },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error';
          const attempts = (evt.attempts ?? 0) + 1;
          const delayMs = attempts === 1 ? 1000 : attempts === 2 ? 5000 : attempts === 3 ? 30000 : 60000;
          await this.outboxModel.updateOne(
            { _id: evt._id },
            {
              $set: {
                status: 'FAILED',
                error: message,
                nextAttemptAt: new Date(Date.now() + delayMs),
              },
              $inc: { attempts: 1 },
            },
          );
          await sleep(5);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async claimNext(): Promise<OutboxEventDocument | null> {
    const now = new Date();
    const doc = await this.outboxModel.findOneAndUpdate(
      {
        status: { $in: ['PENDING', 'FAILED'] },
        $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: { $lte: now } }],
      },
      {
        $set: { status: 'PROCESSING', lockedAt: now, lockedBy: this.workerId },
      },
      { sort: { createdAt: 1 }, new: true },
    );
    return doc;
  }
}

