// AI-assisted: see AI-ATTRIBUTION.md
import { AuthSession } from "../dao/AuthTokenDao";
import { Service } from "./Service";

export class AuthorizationService extends Service {
  public async authorize(token: string): Promise<AuthSession> {
    const session = token.trim()
      ? await this.factory.authTokenDao.get(token)
      : null;

    if (session === null) {
      throw new Error("[Bad Request] User is not authorized");
    }

    return session;
  }
}
