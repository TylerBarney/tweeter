// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";
import { AuthSession, AuthTokenDao } from "../AuthTokenDao";
import { DynamoDao } from "./DynamoDao";
import { getDocumentClient, requireEnv } from "./documentClient";

const SESSION_SECONDS = 30 * 60;

export class DynamoAuthTokenDao extends DynamoDao implements AuthTokenDao {
  private readonly authTokensTable: string;

  public constructor(client = getDocumentClient()) {
    super(client);
    this.authTokensTable = requireEnv("AUTH_TOKENS_TABLE");
  }

  public async create(alias: string): Promise<AuthToken> {
    const authToken = AuthToken.Generate();
    const created = await this.putItem(
      this.authTokensTable,
      {
        token: authToken.token,
        alias,
        timestamp: authToken.timestamp,
        expiresAt: this.expiresAt(authToken.timestamp),
      },
      "attribute_not_exists(token)",
    );

    if (!created) {
      throw new Error("[Server Error] Could not create an auth token");
    }

    return authToken;
  }

  public async get(token: string): Promise<AuthSession | null> {
    const item = await this.getItem(this.authTokensTable, { token });
    if (item === undefined || this.isExpired(item.expiresAt)) {
      return null;
    }

    const timestamp = Date.now();
    const renewed = await this.updateItem(
      this.authTokensTable,
      { token },
      {
        expression: "SET #timestamp = :timestamp, expiresAt = :expiresAt",
        names: { "#timestamp": "timestamp" },
        values: {
          ":timestamp": timestamp,
          ":expiresAt": this.expiresAt(timestamp),
        },
        condition: "attribute_exists(token)",
      },
    );

    if (
      !renewed ||
      typeof item.alias !== "string" ||
      item.alias.length === 0
    ) {
      return null;
    }

    return {
      authToken: new AuthToken(token, timestamp),
      alias: item.alias,
    };
  }

  public delete(token: string): Promise<void> {
    return this.deleteItem(this.authTokensTable, { token });
  }

  private expiresAt(timestamp: number): number {
    return Math.floor(timestamp / 1000) + SESSION_SECONDS;
  }

  private isExpired(expiresAt: unknown): boolean {
    return (
      typeof expiresAt !== "number" ||
      expiresAt <= Math.floor(Date.now() / 1000)
    );
  }
}
