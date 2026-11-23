// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import {
  BatchGetCommand,
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DataPage } from "../DataPage";

export type DynamoItem = Record<string, unknown>;

const BATCH_WRITE_LIMIT = 25;
const BATCH_GET_LIMIT = 100;

type QueryPageOptions<T> = {
  tableName: string;
  indexName?: string;
  partitionKey: string;
  partitionValue: string;
  sortKey: string;
  limit: number;
  startSortValue?: string | number;
  scanIndexForward?: boolean;
  mapItem: (item: DynamoItem) => T;
};

export abstract class DynamoDao {
  protected constructor(protected readonly client: DynamoDBDocumentClient) {}

  protected async queryPage<T>(
    options: QueryPageOptions<T>,
  ): Promise<DataPage<T>> {
    const page = await this.sendQuery(options);
    return new DataPage(page.values, page.lastKey !== undefined);
  }

  protected async eachQueryPage<T>(
    options: QueryPageOptions<T>,
    visit: (values: T[]) => Promise<void>,
  ): Promise<void> {
    let startKey: Record<string, unknown> | undefined;
    do {
      const page = await this.sendQuery(options, startKey);
      if (page.values.length > 0) {
        await visit(page.values);
      }
      options = { ...options, startSortValue: undefined };
      startKey = page.lastKey;
    } while (startKey !== undefined);
  }

  private async sendQuery<T>(
    options: QueryPageOptions<T>,
    exclusiveStartKey?: Record<string, unknown>,
  ): Promise<{ values: T[]; lastKey?: Record<string, unknown> }> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: options.tableName,
        ...(options.indexName === undefined
          ? {}
          : { IndexName: options.indexName }),
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: { "#pk": options.partitionKey },
        ExpressionAttributeValues: { ":pk": options.partitionValue },
        Limit: options.limit,
        ScanIndexForward: options.scanIndexForward ?? true,
        ...this.startKey(options, exclusiveStartKey),
      }),
    );

    return {
      values: (result.Items ?? []).map((item) =>
        options.mapItem(item as DynamoItem),
      ),
      lastKey: result.LastEvaluatedKey as Record<string, unknown> | undefined,
    };
  }

  private startKey<T>(
    options: QueryPageOptions<T>,
    exclusiveStartKey?: Record<string, unknown>,
  ): { ExclusiveStartKey?: Record<string, unknown> } {
    if (exclusiveStartKey !== undefined) {
      return { ExclusiveStartKey: exclusiveStartKey };
    }

    if (options.startSortValue === undefined) {
      return {};
    }

    return {
      ExclusiveStartKey: {
        [options.partitionKey]: options.partitionValue,
        [options.sortKey]: options.startSortValue,
      },
    };
  }

  protected async getItem(
    tableName: string,
    key: DynamoItem,
  ): Promise<DynamoItem | undefined> {
    const result = await this.client.send(
      new GetCommand({
        TableName: tableName,
        Key: key,
      }),
    );

    return result.Item as DynamoItem | undefined;
  }

  protected toUser(item: DynamoItem): User {
    return new User(
      String(item.firstName),
      String(item.lastName),
      String(item.alias),
      String(item.imageUrl),
    );
  }

  protected putItem(
    tableName: string,
    item: DynamoItem,
    condition?: string,
    names?: Record<string, string>,
  ): Promise<boolean> {
    return this.write(() =>
      this.client.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ...(condition === undefined
            ? {}
            : { ConditionExpression: condition }),
          ...(names === undefined ? {} : { ExpressionAttributeNames: names }),
        }),
      ),
    );
  }

  protected updateItem(
    tableName: string,
    key: DynamoItem,
    options: {
      expression: string;
      names?: Record<string, string>;
      values?: DynamoItem;
      condition?: string;
    },
  ): Promise<boolean> {
    return this.write(() =>
      this.client.send(
        new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: options.expression,
          ...(options.names === undefined
            ? {}
            : { ExpressionAttributeNames: options.names }),
          ...(options.values === undefined
            ? {}
            : { ExpressionAttributeValues: options.values }),
          ...(options.condition === undefined
            ? {}
            : { ConditionExpression: options.condition }),
        }),
      ),
    );
  }

  protected async deleteItem(
    tableName: string,
    key: DynamoItem,
  ): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key,
      }),
    );
  }

  private async write(send: () => Promise<unknown>): Promise<boolean> {
    try {
      await send();
      return true;
    } catch (error) {
      if (this.errorName(error) === "ConditionalCheckFailedException") {
        return false;
      }

      throw error;
    }
  }

  protected errorName(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null) {
      return undefined;
    }

    const name = (error as { name?: unknown }).name;
    return typeof name === "string" ? name : undefined;
  }

  protected async usersByAlias(
    tableName: string,
    aliases: string[],
  ): Promise<Map<string, User>> {
    const unique = [...new Set(aliases)];
    if (unique.length === 0) {
      return new Map();
    }

    const items =
      unique.length === 1
        ? [await this.getItem(tableName, { alias: unique[0] })].filter(
            (item): item is DynamoItem => item !== undefined,
          )
        : await this.batchGet(
            tableName,
            unique.map((alias) => ({ alias })),
          );

    return new Map(items.map((item) => [String(item.alias), this.toUser(item)]));
  }

  protected async mapWithUsers<T, R>(
    usersTable: string,
    items: T[],
    aliasOf: (item: T) => string,
    build: (item: T, user: User) => R,
  ): Promise<R[]> {
    const users = await this.usersByAlias(usersTable, items.map(aliasOf));
    return items.flatMap((item) => {
      const user = users.get(aliasOf(item));
      return user === undefined ? [] : [build(item, user)];
    });
  }

  protected async batchWrite(
    tableName: string,
    items: DynamoItem[],
  ): Promise<void> {
    let pending = items;
    while (pending.length > 0) {
      let request = pending.slice(0, BATCH_WRITE_LIMIT).map((item) => ({
        PutRequest: { Item: item },
      }));
      pending = pending.slice(BATCH_WRITE_LIMIT);

      while (request.length > 0) {
        const result = await this.client.send(
          new BatchWriteCommand({
            RequestItems: { [tableName]: request },
          }),
        );
        request = (result.UnprocessedItems?.[tableName] ?? []) as typeof request;
      }
    }
  }

  protected async batchGet(
    tableName: string,
    keys: DynamoItem[],
  ): Promise<DynamoItem[]> {
    const items: DynamoItem[] = [];
    let pending = keys;

    while (pending.length > 0) {
      let request = pending.slice(0, BATCH_GET_LIMIT);
      pending = pending.slice(BATCH_GET_LIMIT);

      while (request.length > 0) {
        const result = await this.client.send(
          new BatchGetCommand({
            RequestItems: {
              [tableName]: { Keys: request },
            },
          }),
        );

        items.push(...((result.Responses?.[tableName] ?? []) as DynamoItem[]));
        request = (result.UnprocessedKeys?.[tableName]?.Keys ??
          []) as DynamoItem[];
      }
    }

    return items;
  }
}
