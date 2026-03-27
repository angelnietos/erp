/**
 * CQRS Query Interface
 * 
 * Base interface for all queries in the CQRS pattern.
 */
export interface IQuery {
  /** Unique identifier for the query */
  queryId?: string;
}

/**
 * CQRS Query Handler Interface
 * 
 * Interface for handling queries.
 */
export interface IQueryHandler<TQuery extends IQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

/**
 * Abstract Query Bus
 * 
 * Base class for query dispatching.
 */
export abstract class QueryBus {
  abstract register<TQuery extends IQuery, TResult>(
    queryType: new () => TQuery,
    handler: IQueryHandler<TQuery, TResult>
  ): void;

  abstract execute<TQuery extends IQuery, TResult>(query: TQuery): Promise<TResult>;
}
