// AI-assisted: see AI-ATTRIBUTION.md
import bcrypt from "bcryptjs";
import { User } from "tweeter-shared";
import { UserDao } from "../UserDao";
import { DynamoDao } from "./DynamoDao";
import { getDocumentClient, requireEnv } from "./documentClient";

const PASSWORD_ROUNDS = 10;

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

  public async authenticate(
    alias: string,
    password: string,
  ): Promise<User | null> {
    const item = await this.getItem(this.usersTable, { alias });
    const passwordHash = item?.passwordHash;
    if (item === undefined || typeof passwordHash !== "string") {
      return null;
    }

    const matches = await bcrypt.compare(password, passwordHash);
    return matches ? this.toUser(item) : null;
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
  ): Promise<User | null> {
    const created = await this.putItem(
      this.usersTable,
      {
        alias,
        firstName,
        lastName,
        imageUrl,
        passwordHash: await bcrypt.hash(password, PASSWORD_ROUNDS),
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
