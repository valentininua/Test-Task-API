import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { getConfig } from '../../shared/config/get-config';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './presentation/jwt.strategy';
import { AuthService } from './application/auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => {
        const config = getConfig();
        return {
          secret: config.jwtSecret,
          signOptions: {
            issuer: config.jwtIssuer,
            audience: config.jwtAudience,
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}

