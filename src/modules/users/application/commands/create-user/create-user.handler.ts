import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { OutboxService } from '../../../../../shared/infrastructure/outbox/outbox.service';
import { CreateUserCommand } from './create-user.command';
import { UsersRepository } from '../../../infrastructure/persistence/users.repository';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateUserCommand) {
    const created = await this.usersRepo.create(command.payload);
    await this.outbox.enqueue({
      type: 'UserCreated',
      aggregateType: 'User',
      aggregateId: created.id,
      payload: {
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
      },
    });
    return created;
  }
}

