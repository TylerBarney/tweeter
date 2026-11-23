// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { TransactWriteCommand, TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { DataPage } from "../DataPage";
import { FollowDao } from "../FollowDao";
import { DynamoDao } from "./DynamoDao";
import { getDocumentClient, requireEnv } from "./documentClient";

const FOLLOWER_ALIAS_PAGE_SIZE = 100;

type TransactItem = NonNullable<TransactWriteCommandInput["TransactItems"]>[number];

export class DynamoFollowDao extends DynamoDao implements FollowDao {
  private readonly followsTable: string;
  private readonly followersIndex: string;
  private readonly usersTable: string;

  public constructor(client = getDocumentClient()) {
    super(client);
    this.followsTable = requireEnv("FOLLOWS_TABLE");
    this.followersIndex = requireEnv("FOLLOWS_FOLLOWERS_INDEX");
    this.usersTable = requireEnv("USERS_TABLE");
  }

  public getFollowees(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): Promise<DataPage<User>> {
    return this.pageOfUsers(
      alias,
      pageSize,
      lastUser,
      "followerAlias",
      "followeeAlias",
    );
  }

  public async getFollowerAliases(alias: string): Promise<string[]> {
    const aliases: string[] = [];
    await this.eachQueryPage(
      {
        tableName: this.followsTable,
        indexName: this.followersIndex,
        partitionKey: "followeeAlias",
        partitionValue: alias,
        sortKey: "followerAlias",
        limit: FOLLOWER_ALIAS_PAGE_SIZE,
        mapItem: (item) =>
          typeof item.followerAlias === "string" ? item.followerAlias : "",
      },
      async (page) => {
        aliases.push(...page.filter((follower) => follower.length > 0));
      },
    );
    return aliases;
  }

  public getFollowers(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): Promise<DataPage<User>> {
    return this.pageOfUsers(
      alias,
      pageSize,
      lastUser,
      "followeeAlias",
      "followerAlias",
      this.followersIndex,
    );
  }

  public async isFollower(
    followerAlias: string,
    followeeAlias: string,
  ): Promise<boolean> {
    const item = await this.getItem(this.followsTable, {
      followerAlias,
      followeeAlias,
    });
    return item !== undefined;
  }

  public follow(followerAlias: string, followeeAlias: string): Promise<void> {
    return this.writeFollow(followerAlias, followeeAlias, true);
  }

  public unfollow(
    followerAlias: string,
    followeeAlias: string,
  ): Promise<void> {
    return this.writeFollow(followerAlias, followeeAlias, false);
  }

  public getFollowerCount(alias: string): Promise<number> {
    return this.count(alias, "followerCount");
  }

  public getFolloweeCount(alias: string): Promise<number> {
    return this.count(alias, "followeeCount");
  }

  private async pageOfUsers(
    alias: string,
    pageSize: number,
    lastUser: User | null,
    partitionKey: string,
    sortKey: string,
    indexName?: string,
  ): Promise<DataPage<User>> {
    const aliases = await this.queryPage<string>({
      tableName: this.followsTable,
      indexName,
      partitionKey,
      partitionValue: alias,
      sortKey,
      limit: pageSize,
      startSortValue: lastUser === null ? undefined : lastUser.alias,
      mapItem: (item) => String(item[sortKey]),
    });
    const users = await this.usersByAlias(this.usersTable, aliases.values);
    return new DataPage(
      aliases.values.flatMap((alias) => {
        const user = users.get(alias);
        return user === undefined ? [] : [user];
      }),
      aliases.hasMorePages,
    );
  }

  private async count(alias: string, attribute: string): Promise<number> {
    const item = await this.getItem(this.usersTable, { alias }, attribute);
    const value = item?.[attribute];
    return typeof value === "number" ? value : 0;
  }

  private async writeFollow(
    followerAlias: string,
    followeeAlias: string,
    following: boolean,
  ): Promise<void> {
    if (followerAlias === followeeAlias) {
      throw new Error("[Bad Request] A user cannot follow themselves");
    }

    const delta = following ? 1 : -1;
    const edge: TransactItem = following
      ? {
          Put: {
            TableName: this.followsTable,
            Item: { followerAlias, followeeAlias },
            ConditionExpression: "attribute_not_exists(followerAlias)",
          },
        }
      : {
          Delete: {
            TableName: this.followsTable,
            Key: { followerAlias, followeeAlias },
            ConditionExpression: "attribute_exists(followerAlias)",
          },
        };

    try {
      await this.client.send(
        new TransactWriteCommand({
          TransactItems: [
            edge,
            this.userCountUpdate(followerAlias, "followeeCount", delta),
            this.userCountUpdate(followeeAlias, "followerCount", delta),
          ],
        }),
      );
    } catch (error) {
      const message = this.conditionalFailureMessage(error, following);
      if (message !== undefined) {
        throw new Error(message);
      }

      throw error;
    }
  }

  private userCountUpdate(
    alias: string,
    attribute: string,
    delta: number,
  ): TransactItem {
    return {
      Update: {
        TableName: this.usersTable,
        Key: { alias },
        UpdateExpression: "ADD #count :delta",
        ConditionExpression: "attribute_exists(alias)",
        ExpressionAttributeNames: { "#count": attribute },
        ExpressionAttributeValues: { ":delta": delta },
      },
    };
  }

  private conditionalFailureMessage(
    error: unknown,
    following: boolean,
  ): string | undefined {
    if (typeof error !== "object" || error === null) {
      return undefined;
    }

    const candidate = error as {
      CancellationReasons?: { Code?: string }[];
    };
    if (this.errorName(error) !== "TransactionCanceledException") {
      return undefined;
    }

    const reasons = candidate.CancellationReasons ?? [];
    if (reasons[0]?.Code === "ConditionalCheckFailed") {
      return following
        ? "[Bad Request] Already following this user"
        : "[Bad Request] Not following this user";
    }

    if (reasons.some((reason) => reason.Code === "ConditionalCheckFailed")) {
      return "[Bad Request] User not found";
    }

    return undefined;
  }
}
