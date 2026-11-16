// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken, User } from "tweeter-shared";
import { Buffer } from "buffer";
import { Service } from "./Service";

export class UserService extends Service {
  public async getUser(
    authToken: AuthToken,
    alias: string,
  ): Promise<User | null> {
    return this.serverFacade.getUser({
      token: authToken.token,
      alias,
    });
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<[User, AuthToken]> {
    return this.serverFacade.login({ alias, password });
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string,
  ): Promise<[User, AuthToken]> {
    return this.serverFacade.register({
      firstName,
      lastName,
      alias,
      password,
      userImageBytes: Buffer.from(userImageBytes).toString("base64"),
      imageFileExtension,
    });
  }

  public async logout(authToken: AuthToken): Promise<void> {
    await this.serverFacade.logout({ token: authToken.token });
  }
}
