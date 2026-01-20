import { Body, Controller, Get, Logger, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserCommand } from '../application/commands/create-user/create-user.command';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id/get-user-by-id.query';
import { GetUsersQuery } from '../application/queries/get-users/get-users.query';
import { UsersSeeder } from '../infrastructure/seed/users.seeder';
import type { CursorPage } from '../infrastructure/persistence/users.repository';
import { UserEntity } from '../domain/user.entity';
import { randomUser } from './utils/random-user';
import { AddUserDto } from './dto/add-user.dto';
import { GetUsersQueryDto } from './dto/get-users.query.dto';
import { GetUsersResponseDto, UserResponseDto } from './dto/user.response.dto';

function toUserResponseDto(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
  };
}

@ApiTags('users')
@ApiBearerAuth('bearer')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly seeder: UsersSeeder,
  ) {}

  @Post('add-user')
  @ApiOkResponse({ type: UserResponseDto })
  async addUser(@Body() dto: AddUserDto): Promise<UserResponseDto> {
    const generated = randomUser();
    const payload = {
      name: dto.name ?? generated.name,
      email: dto.email ?? generated.email,
      phone: dto.phone ?? generated.phone,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : generated.dateOfBirth,
    };

    const created = await this.commandBus.execute(new CreateUserCommand(payload));
    this.logger.log(`USER_CREATED id=${created.id} email=${created.email} phone=${created.phone}`);

    return toUserResponseDto(created);
  }

  @Get('get-users')
  @ApiOkResponse({ type: GetUsersResponseDto })
  async getUsers(@Query() q: GetUsersQueryDto): Promise<GetUsersResponseDto> {
    await this.seeder.waitUntilReady();

    const result: CursorPage<UserEntity> = await this.queryBus.execute(
      new GetUsersQuery({
        limit: q.limit ?? 50,
        cursor: q.cursor,
        filter: {
          name: q.name,
          email: q.email,
          phone: q.phone,
        },
      }),
    );

    return {
      items: result.items.map(toUserResponseDto),
      nextCursor: result.nextCursor,
    };
  }

  @Get('get-user/:id')
  @ApiOkResponse({ type: UserResponseDto })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    await this.seeder.waitUntilReady();

    const user: UserEntity | null = await this.queryBus.execute(new GetUserByIdQuery(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponseDto(user);
  }
}

