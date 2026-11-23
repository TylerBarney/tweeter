// AI-assisted: see AI-ATTRIBUTION.md
import { Status } from "tweeter-shared";
import { DynamoItem } from "./DynamoDao";
import { DynamoStatusDao } from "./DynamoStatusDao";
import { getDocumentClient, requireEnv } from "./documentClient";

export class DynamoStoryDao extends DynamoStatusDao {
  public constructor(client = getDocumentClient()) {
    super(
      client,
      requireEnv("STORY_TABLE"),
      requireEnv("USERS_TABLE"),
      "timestamp",
    );
  }

  public async put(status: Status): Promise<void> {
    await this.putItem(this.statusTable, {
      alias: status.user.alias,
      timestamp: status.timestamp,
      post: status.post,
    });
  }

  protected sortValue(status: Status): number {
    return status.timestamp;
  }

  protected authorAlias(_item: DynamoItem, pageAlias: string): string {
    return pageAlias;
  }
}
