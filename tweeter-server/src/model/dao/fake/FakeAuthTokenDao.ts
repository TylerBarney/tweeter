// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";
import { AuthSession, AuthTokenDao } from "../AuthTokenDao";
import { FakeDao } from "./FakeDao";

export class FakeAuthTokenDao extends FakeDao implements AuthTokenDao {
  public async create(_alias: string): Promise<AuthToken> {
    return this.data.authToken;
  }

  public async get(token: string): Promise<AuthSession | null> {
    const authToken = this.data.authToken;
    const user = this.data.firstUser;
    if (authToken.token !== token || user === null) {
      return null;
    }

    return { authToken, alias: user.alias };
  }

  public async delete(_token: string): Promise<void> {}
}
