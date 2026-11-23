// AI-assisted: see AI-ATTRIBUTION.md
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
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
