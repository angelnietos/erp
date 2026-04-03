# Shared CQRS

CQRS (Command Query Responsibility Segregation) library providing interfaces for commands and queries.

## Usage

### Define a Command

```typescript
import { ICommand } from '@josanz-erp/shared-cqrs';

class CreateUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly name: string
  ) {}
}
```

### Define a Command Handler

```typescript
import { ICommandHandler } from '@josanz-erp/shared-cqrs';
import { CreateUserCommand } from './create-user.command';

class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = new User({
      email: command.email,
      name: command.name,
    });
    return this.userRepository.save(user);
  }
}
```

### Define a Query

```typescript
import { IQuery } from '@josanz-erp/shared-cqrs';

class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
```

### Define a Query Handler

```typescript
import { IQueryHandler } from '@josanz-erp/shared-cqrs';
import { GetUserByIdQuery } from './get-user-by-id.query';

class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, User | null> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return this.userRepository.findById(query.userId);
  }
}
```

## API

### Commands

- **ICommand**: Base interface for commands
- **ICommandHandler**: Interface for command handlers
- **CommandBus**: Abstract command bus

### Queries

- **IQuery**: Base interface for queries
- **IQueryHandler**: Interface for query handlers
- **QueryBus**: Abstract query bus
