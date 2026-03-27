/**
 * Shared CQRS Library
 * 
 * Provides Command and Query interfaces for CQRS pattern.
 * 
 * Usage:
 * ```typescript
 * import { ICommand, ICommandHandler, IQuery, IQueryHandler } from '@josanz-erp/shared-cqrs';
 * 
 * // Define a command
 * class CreateUserCommand implements ICommand {
 *   constructor(public readonly email: string, public readonly name: string) {}
 * }
 * 
 * // Define a command handler
 * class CreateUserHandler implements ICommandHandler<CreateUserCommand, User> {
 *   async execute(command: CreateUserCommand): Promise<User> {
 *     // Create user logic
 *   }
 * }
 * ```
 */

// Commands
export { ICommand, ICommandHandler, CommandBus } from './lib/commands/command.interface';

// Queries
export { IQuery, IQueryHandler, QueryBus } from './lib/queries/query.interface';
