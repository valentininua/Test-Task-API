import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { OutboxModule } from '../../shared/infrastructure/outbox/outbox.module';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { GetUsersHandler } from './application/queries/get-users/get-users.handler';
import { User, UserSchema } from './infrastructure/persistence/user.schema';
import { UsersRepository } from './infrastructure/persistence/users.repository';
import { UsersController } from './presentation/users.controller';
import { UsersSeeder } from './infrastructure/seed/users.seeder';

@Module({
  imports: [
    CqrsModule,
    OutboxModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersSeeder,
    CreateUserHandler,
    GetUsersHandler,
    GetUserByIdHandler,
  ],
})
export class UsersModule {}

