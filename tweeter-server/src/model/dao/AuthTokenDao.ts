// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";

export interface AuthSession {
  readonly authToken: AuthToken;
  readonly alias: string;
}

export interface AuthTokenRecord extends AuthSession {
  readonly expiresAt: number;
}

export interface AuthTokenDao {
  create(
    authToken: AuthToken,
    alias: string,
    expiresAt: number,
  ): Promise<boolean>;

  get(token: string): Promise<AuthTokenRecord | null>;

  renew(token: string, timestamp: number, expiresAt: number): Promise<boolean>;

  delete(token: string): Promise<void>;
}
