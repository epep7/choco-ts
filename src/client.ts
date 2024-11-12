import { Auth } from "./auth/auth.ts";
import { QueryBuilder } from "./query/query-builder.ts";

export class Client {
  constructor(public apiKey: string, public url: string) {}

  private _queryBuilder<T>() {
    return new QueryBuilder<T>(this);
  }

  /**
   *
   * @param table string
   * @returns
   */
  public db<T>(
    table: string
  ) {
    return this._queryBuilder<T>().from<T>(table);
  }

  public get auth() : Auth {
    return new Auth(this)
  }
}
