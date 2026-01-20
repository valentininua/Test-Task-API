import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { getConfig } from '../../config/get-config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const config = getConfig();
        return {
          uri: config.mongoUri,
          autoIndex: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}

