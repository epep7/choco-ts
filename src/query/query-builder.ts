import type { Client } from "../client.ts";

type WhereStatement<T> = {
  grouping: string;
  type: string;
  column?: string | number | symbol | undefined;
  operator?: string;
  value?: WhereStatement<T>[] | string | undefined | number;
  separator: string | T;
};

export class QueryBuilder<T> {
  private _statements: WhereStatement<QueryBuilder<T>>[] = [];
  private _separatorFlag = "AND";
  private _isFirst = false;
  private table: string = "";
  private _method = "SELECT";

  /**
   * @description for insert and update
   */
  private _data = {};

  constructor(private client: Client) {}

  public from<T>(
    table: string
  ): Omit<QueryBuilder<T>, "from"> {
    this.table = table;

    return this as unknown as QueryBuilder<T>;
  }

  public insert(
    data: Record<string, string>
  ): Omit<this, "where" | "andWhere" | "orWhere" | "first" | "from"> {
    this._data = data;
    this._method = "INSERT";

    return this;
  }

  public where(
    column?: keyof T | string | ((qb: QueryBuilder<T>) => void),
    op?: string,
    value?: string | undefined | number
  ): this {
    if (typeof column === "function") {
      return this.whereWrapped(column);
    }

    this._statements.push({
      grouping: "where",
      type: "basic",
      column,
      operator: op,
      value,
      separator: this._separator(),
    });

    return this;
  }

  public andWhere(
    column?: keyof T | ((qb: QueryBuilder<T>) => void),
    op?: string,
    value?: string | undefined | number
  ): this {
    return this.where(column, op, value);
  }

  public orWhere(
    column?: keyof T | ((qb: QueryBuilder<T>) => void),
    op?: string,
    value?: string | undefined | number
  ): this {
    this._separator("OR");

    return this.where(column, op, value);
  }

  private whereWrapped(callback: (qb: this) => void) {
    const query = new QueryBuilder<T>(this.client);

    callback.call(query, query as this);

    this._statements.push({
      grouping: "where",
      type: "whereWrapped",
      value: query._statements,
      separator: this._separator(),
    });

    return this;
  }

  public first(): this {
    this._isFirst = true;
    return this;
  }

  private _separator(value?: string) {
    if (value != null) {
      this._separatorFlag = value;
      return this;
    }

    const ret = this._separatorFlag;

    this._separatorFlag = "AND";

    return ret;
  }

  private toBody() {
    const body = {} as {
      where: WhereStatement<QueryBuilder<T>>[];
      method: string;
      first: boolean;
      data: Record<string, string | number>
    };

    if (!this.table) {
      throw new Error("table must be declared");
    }

    if (this._method === "select") {
      body["method"] = "select";

      if (this._statements.length > 0) {
        body["where"] = this._statements;

        if (this._isFirst) {
          body["first"] = true;
        }
      }
    } else if (this._method === "insert") {
      body ["method"] === "insert"

      body["data"] = this._data
    }

    return body;
  }

  private _fetch(): Promise<T> {
    return new Promise((resolve, reject) => {
      fetch(`${this.client.apiKey}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          body: JSON.stringify(this.toBody()),
        },
      }).then(async (value) => {
        if (value.ok) {
          return resolve(value.json());
        } else {
          const result = await value.json();

          return reject(result);
        }
      });
    });
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this._fetch().then(onfulfilled, onrejected);
  }

  public catch(onRejected?: (reason: unknown) => never | Promise<never>) {
    return this._fetch().catch(onRejected);
  }
}
