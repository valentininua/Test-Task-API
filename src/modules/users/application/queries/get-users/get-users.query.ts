import type { UsersFilter } from '../../../infrastructure/persistence/users.repository';

export class GetUsersQuery {
  constructor(
    public readonly input: {
      limit: number;
      cursor?: string;
      filter?: UsersFilter;
    },
  ) {}
}

