/**
 * CQRS Command Interface
 * 
 * Base interface for all commands in the CQRS pattern.
 */
export interface ICommand {
  /** Unique identifier for the command */
  commandId?: string;
}

/**
 * CQRS Command Handler Interface
 * 
 * Interface for handling commands.
 */
export interface ICommandHandler<TCommand extends ICommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
}

/**
 * Abstract Command Bus
 * 
 * Base class for command dispatching.
 */
export abstract class CommandBus {
  abstract register<TCommand extends ICommand, TResult>(
    commandType: new () => TCommand,
    handler: ICommandHandler<TCommand, TResult>
  ): void;

  abstract execute<TCommand extends ICommand, TResult>(command: TCommand): Promise<TResult>;
}
