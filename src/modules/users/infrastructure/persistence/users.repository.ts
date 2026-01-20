import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Model } from 'mongoose';

import { UserEntity } from '../../domain/user.entity';
import { User, type UserDocument } from './user.schema';

export type CreateUserInput = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
};

export type UsersFilter = {
  name?: string;
  email?: string;
  phone?: string;
};

export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type GetUsersInput = {
  limit: number;
  cursor?: string;
  filter?: UsersFilter;
};

export function encodeCursor(id: string): string {
  return Buffer.from(id, 'utf8').toString('base64');
}
export function decodeCursor(cursor: string): string {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    if (!Types.ObjectId.isValid(decoded)) {
      throw new BadRequestException('Invalid cursor');
    }
    return decoded;
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
}

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(user: CreateUserInput): Promise<UserEntity> {
    const created = await this.userModel.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
    });
    return new UserEntity({
      id: created._id.toString(),
      name: created.name,
      email: created.email,
      phone: created.phone,
      dateOfBirth: created.dateOfBirth,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.userModel.findById(id).exec();
    if (!doc) return null;
    return new UserEntity({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      dateOfBirth: doc.dateOfBirth,
    });
  }

  async getUsers(input: GetUsersInput): Promise<CursorPage<UserEntity>> {
    const query: Record<string, unknown> = {};

    const filter = input.filter ?? {};
    if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
    if (filter.email) query.email = { $regex: filter.email, $options: 'i' };
    if (filter.phone) query.phone = { $regex: filter.phone, $options: 'i' };

    if (input.cursor) {
      const decoded = decodeCursor(input.cursor);
      query._id = { $gt: new Types.ObjectId(decoded) };
    }

    const limit = Math.max(1, Math.min(input.limit, 200));

    const docs = await this.userModel
      .find(query)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .exec();

    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const items = pageDocs.map(
      (doc) =>
        new UserEntity({
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          dateOfBirth: doc.dateOfBirth,
        }),
    );

    const nextCursor = hasMore ? encodeCursor(pageDocs[pageDocs.length - 1]!._id.toString()) : null;
    return { items, nextCursor };
  }

  async estimatedCount(): Promise<number> {
    return await this.userModel.estimatedDocumentCount().exec();
  }

  async insertMany(raw: Array<Pick<User, 'name' | 'email' | 'phone' | 'dateOfBirth'>>): Promise<void> {
    if (raw.length === 0) return;
    await this.userModel.insertMany(raw, { ordered: false });
  }
}

