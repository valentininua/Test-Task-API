import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type TokenPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const expectedUser = process.env.AUTH_USERNAME ?? 'admin';
    const expectedPass = process.env.AUTH_PASSWORD ?? 'admin';

    if (username !== expectedUser || password !== expectedPass) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: TokenPayload = { sub: username, username };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken };
  }
}

