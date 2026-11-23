// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";
import { AuthTokenDao, AuthTokenRecord } from "../AuthTokenDao";
import { DynamoDao } from "./DynamoDao";
import { getDocumentClient, requireEnv } from "./documentClient";

export class DynamoAuthTokenDao extends DynamoDao implements AuthTokenDao {
  private readonly authTokensTable: string;

  public constructor(client = getDocumentClient()) {
    super(client);
    this.authTokensTable = requireEnv("AUTH_TOKENS_TABLE");
  }

  public create(
    authToken: AuthToken,
    alias: string,
    expiresAt: number,
  ): Promise<boolean> {
    return this.putItem(
      this.authTokensTable,
      {
        token: authToken.token,
        alias,
        timestamp: authToken.timestamp,
        expiresAt,
      },
      "attribute_not_exists(token)",
    );
  }

  public async get(token: string): Promise<AuthTokenRecord | null> {
    const item = await this.getItem(this.authTokensTable, { token });
    if (
      item === undefined ||
      typeof item.alias !== "string" ||
      item.alias.length === 0 ||
      typeof item.timestamp !== "number" ||
      typeof item.expiresAt !== "number"
    ) {
      return null;
    }

    return {
      authToken: new AuthToken(token, item.timestamp),
      alias: item.alias,
      expiresAt: item.expiresAt,
    };
  }

  public renew(
    token: string,
    timestamp: number,
    expiresAt: number,
  ): Promise<boolean> {
    return this.updateItem(this.authTokensTable, { token }, {
      expression: "SET #timestamp = :timestamp, expiresAt = :expiresAt",
      names: { "#timestamp": "timestamp" },
      values: {
        ":timestamp": timestamp,
        ":expiresAt": expiresAt,
      },
      condition: "attribute_exists(token)",
    });
  }

  public delete(token: string): Promise<void> {
    return this.deleteItem(this.authTokensTable, { token });
  }
}
