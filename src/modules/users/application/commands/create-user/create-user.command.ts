import type { CreateUserInput } from '../../../infrastructure/persistence/users.repository';

export class CreateUserCommand {
  constructor(public readonly payload: CreateUserInput) {}
}

