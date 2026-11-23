// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DataPage } from "../DataPage";

export type DynamoItem = Record<string, unknown>;

type QueryPageOptions<T> = {
  tableName: string;
  indexName?: string;
  partitionKey: string;
  partitionValue: string;
  sortKey: string;
  limit: number;
  startSortValue?: string;
  scanIndexForward?: boolean;
  mapItem: (item: DynamoItem) => T;
};

export abstract class DynamoDao {
  protected constructor(protected readonly client: DynamoDBDocumentClient) {}

  protected async queryPage<T>(
    options: QueryPageOptions<T>,
  ): Promise<DataPage<T>> {
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
        ...(options.startSortValue === undefined
          ? {}
          : {
              ExclusiveStartKey: {
                [options.partitionKey]: options.partitionValue,
                [options.sortKey]: options.startSortValue,
              },
            }),
      }),
    );

    const values = (result.Items ?? []).map((item) =>
      options.mapItem(item as DynamoItem),
    );
    return new DataPage(values, result.LastEvaluatedKey !== undefined);
  }

  protected async getItem(
    tableName: string,
    key: DynamoItem,
    projection?: string,
  ): Promise<DynamoItem | undefined> {
    const result = await this.client.send(
      new GetCommand({
        TableName: tableName,
        Key: key,
        ...(projection === undefined
          ? {}
          : {
              ProjectionExpression: "#attr",
              ExpressionAttributeNames: { "#attr": projection },
            }),
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

  protected async putItem(
    tableName: string,
    item: DynamoItem,
    condition?: string,
  ): Promise<boolean> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ...(condition === undefined
            ? {}
            : { ConditionExpression: condition }),
        }),
      );
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

  protected async batchGet(
    tableName: string,
    keys: DynamoItem[],
  ): Promise<DynamoItem[]> {
    const items: DynamoItem[] = [];
    let pending = keys;

    while (pending.length > 0) {
      const result = await this.client.send(
        new BatchGetCommand({
          RequestItems: {
            [tableName]: { Keys: pending },
          },
        }),
      );

      items.push(...((result.Responses?.[tableName] ?? []) as DynamoItem[]));
      pending = (result.UnprocessedKeys?.[tableName]?.Keys ??
        []) as DynamoItem[];
    }

    return items;
  }
}
