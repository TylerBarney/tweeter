// AI-assisted: see AI-ATTRIBUTION.md
import { Status } from "tweeter-shared";
import { DynamoItem } from "./DynamoDao";
import { DynamoStatusDao } from "./DynamoStatusDao";
import { getDocumentClient, requireEnv } from "./documentClient";

export class DynamoFeedDao extends DynamoStatusDao {
  public constructor(client = getDocumentClient()) {
    super(
      client,
      requireEnv("FEED_TABLE"),
      requireEnv("USERS_TABLE"),
      "postedAt",
    );
  }

  public async put(
    status: Status,
    recipientAliases: string[] = [],
  ): Promise<void> {
    const postedAt = this.sortValue(status);
    await this.batchWrite(
      this.statusTable,
      recipientAliases.map((alias) => ({
        alias,
        postedAt,
        post: status.post,
        timestamp: status.timestamp,
        authorAlias: status.user.alias,
      })),
    );
  }

  protected sortValue(status: Status): string {
    return `${new Date(status.timestamp).toISOString()}#${status.user.alias}`;
  }

  protected authorAlias(item: DynamoItem): string {
    return typeof item.authorAlias === "string" ? item.authorAlias : "";
  }
}
