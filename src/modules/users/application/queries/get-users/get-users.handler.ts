import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../infrastructure/persistence/users.repository';
import { GetUsersQuery } from './get-users.query';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly usersRepo: UsersRepository) {}

  async execute(query: GetUsersQuery) {
    return await this.usersRepo.getUsers(query.input);
  }
}

