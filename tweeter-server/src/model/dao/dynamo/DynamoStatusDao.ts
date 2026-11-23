// AI-assisted: see AI-ATTRIBUTION.md
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Status } from "tweeter-shared";
import { DataPage } from "../DataPage";
import { StatusDao } from "../StatusDao";
import { DynamoDao, DynamoItem } from "./DynamoDao";

type StatusRow = {
  post: string;
  timestamp: number;
  authorAlias: string;
};

export abstract class DynamoStatusDao extends DynamoDao implements StatusDao {
  protected constructor(
    client: DynamoDBDocumentClient,
    protected readonly statusTable: string,
    private readonly usersTable: string,
    private readonly sortKey: string,
  ) {
    super(client);
  }

  public async getPage(
    alias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<DataPage<Status>> {
    const page = await this.queryPage<StatusRow | null>({
      tableName: this.statusTable,
      partitionKey: "alias",
      partitionValue: alias,
      sortKey: this.sortKey,
      limit: pageSize,
      startSortValue: lastItem === null ? undefined : this.sortValue(lastItem),
      scanIndexForward: false,
      mapItem: (item) => this.rowFrom(item, alias),
    });
    const rows = page.values.filter((row): row is StatusRow => row !== null);
    return new DataPage(await this.withUsers(rows), page.hasMorePages);
  }

  public abstract put(
    status: Status,
    recipientAliases?: string[],
  ): Promise<void>;

  protected abstract sortValue(status: Status): string | number;

  protected abstract authorAlias(item: DynamoItem, pageAlias: string): string;

  private rowFrom(item: DynamoItem, pageAlias: string): StatusRow | null {
    const authorAlias = this.authorAlias(item, pageAlias);
    if (
      typeof item.post !== "string" ||
      typeof item.timestamp !== "number" ||
      authorAlias.length === 0
    ) {
      return null;
    }

    return { post: item.post, timestamp: item.timestamp, authorAlias };
  }

  private async withUsers(rows: StatusRow[]): Promise<Status[]> {
    const users = await this.usersByAlias(
      this.usersTable,
      rows.map((row) => row.authorAlias),
    );

    return rows.flatMap((row) => {
      const user = users.get(row.authorAlias);
      return user === undefined ? [] : [new Status(row.post, user, row.timestamp)];
    });
  }
}
