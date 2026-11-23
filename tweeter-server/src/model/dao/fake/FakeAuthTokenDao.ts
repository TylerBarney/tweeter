// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";
import { AuthTokenDao, AuthTokenRecord } from "../AuthTokenDao";
import { FakeDao } from "./FakeDao";

export class FakeAuthTokenDao extends FakeDao implements AuthTokenDao {
  public async create(
    _authToken: AuthToken,
    _alias: string,
    _expiresAt: number,
  ): Promise<boolean> {
    return true;
  }

  public async get(token: string): Promise<AuthTokenRecord | null> {
    const authToken = this.data.authToken;
    const user = this.data.firstUser;
    if (authToken.token !== token || user === null) {
      return null;
    }

    return {
      authToken,
      alias: user.alias,
      expiresAt: Number.MAX_SAFE_INTEGER,
    };
  }

  public async renew(
    _token: string,
    _timestamp: number,
    _expiresAt: number,
  ): Promise<boolean> {
    return true;
  }

  public async delete(_token: string): Promise<void> {}
}
