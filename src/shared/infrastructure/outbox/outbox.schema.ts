import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type OutboxEventDocument = HydratedDocument<OutboxEvent>;

export type OutboxStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

@Schema({ collection: 'outbox_events', timestamps: { createdAt: true, updatedAt: true } })
export class OutboxEvent {
  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  aggregateType!: string;

  @Prop({ required: true })
  aggregateId!: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, unknown>;

  @Prop({ required: true, default: 'PENDING', index: true })
  status!: OutboxStatus;

  @Prop({ required: true, default: 0 })
  attempts!: number;

  @Prop({ required: false, index: true })
  nextAttemptAt?: Date;

  @Prop({ required: false })
  lockedAt?: Date;

  @Prop({ required: false })
  lockedBy?: string;

  @Prop({ required: false })
  processedAt?: Date;

  @Prop({ required: false })
  error?: string;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEvent);

OutboxEventSchema.index({ status: 1, nextAttemptAt: 1, createdAt: 1 });

