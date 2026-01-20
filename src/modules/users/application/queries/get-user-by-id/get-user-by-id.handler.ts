import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersRepository } from '../../../infrastructure/persistence/users.repository';
import { GetUserByIdQuery } from './get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly usersRepo: UsersRepository) {}

  async execute(query: GetUserByIdQuery) {
    return await this.usersRepo.findById(query.id);
  }
}

