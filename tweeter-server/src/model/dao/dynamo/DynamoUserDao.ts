// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { UserDao } from "../UserDao";
import { DynamoDao } from "./DynamoDao";
import { getDocumentClient, requireEnv } from "./documentClient";

export class DynamoUserDao extends DynamoDao implements UserDao {
  private readonly usersTable: string;

  public constructor(client = getDocumentClient()) {
    super(client);
    this.usersTable = requireEnv("USERS_TABLE");
  }

  public async findByAlias(alias: string): Promise<User | null> {
    const item = await this.getItem(this.usersTable, { alias });
    return item === undefined ? null : this.toUser(item);
  }

  public authenticate(alias: string, _password: string): Promise<User | null> {
    return this.findByAlias(alias);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    _password: string,
    imageUrl: string,
  ): Promise<User | null> {
    const created = await this.putItem(
      this.usersTable,
      {
        alias,
        firstName,
        lastName,
        imageUrl,
        followerCount: 0,
        followeeCount: 0,
      },
      "attribute_not_exists(alias)",
    );

    return created
      ? new User(firstName, lastName, alias, imageUrl)
      : null;
  }
}
