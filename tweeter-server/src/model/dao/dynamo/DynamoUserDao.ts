// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { UserCredentials, UserDao } from "../UserDao";
import { DynamoDao, DynamoItem } from "./DynamoDao";
import { getDocumentClient, requireEnv } from "./documentClient";

export class DynamoUserDao extends DynamoDao implements UserDao {
  private readonly usersTable: string;

  public constructor(client = getDocumentClient()) {
    super(client);
    this.usersTable = requireEnv("USERS_TABLE");
  }

  public async findByAlias(alias: string): Promise<User | null> {
    const item = await this.userItem(alias);
    return item === undefined ? null : this.toUser(item);
  }

  public async findByAliasWithPassword(
    alias: string,
  ): Promise<UserCredentials | null> {
    const item = await this.userItem(alias);
    if (item === undefined || typeof item.passwordHash !== "string") {
      return null;
    }

    return { user: this.toUser(item), passwordHash: item.passwordHash };
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    passwordHash: string,
    imageUrl: string,
  ): Promise<User | null> {
    const created = await this.putItem(
      this.usersTable,
      {
        alias,
        firstName,
        lastName,
        imageUrl,
        passwordHash,
        followerCount: 0,
        followeeCount: 0,
      },
      "attribute_not_exists(alias)",
    );

    return created ? new User(firstName, lastName, alias, imageUrl) : null;
  }

  private userItem(alias: string): Promise<DynamoItem | undefined> {
    return this.getItem(this.usersTable, { alias });
  }
}
