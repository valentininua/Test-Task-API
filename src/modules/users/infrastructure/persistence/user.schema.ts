import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: { createdAt: true, updatedAt: true } })
export class User {
  @Prop({ required: true, index: true })
  name!: string;

  @Prop({ required: true, index: true })
  email!: string;

  @Prop({ required: true, index: true })
  phone!: string;

  @Prop({ required: true })
  dateOfBirth!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ name: 1, _id: 1 });
UserSchema.index({ email: 1, _id: 1 });
UserSchema.index({ phone: 1, _id: 1 });

