import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { OutboxModule } from './shared/infrastructure/outbox/outbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    OutboxModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}

