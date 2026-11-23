// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";

export interface AuthSession {
  readonly authToken: AuthToken;
  readonly alias: string;
}

export interface AuthTokenDao {
  create(alias: string): Promise<AuthToken>;

  get(token: string): Promise<AuthSession | null>;

  delete(token: string): Promise<void>;
}
