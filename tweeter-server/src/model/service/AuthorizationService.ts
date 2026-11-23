// AI-assisted: see AI-ATTRIBUTION.md
import bcrypt from "bcryptjs";
import { AuthTokenDto, User, UserDto } from "tweeter-shared";
import { AuthSession } from "../dao/AuthTokenDao";
import { Service } from "./Service";

const PASSWORD_ROUNDS = 10;

export class AuthorizationService extends Service {
  public async login(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    if (!alias.trim()) {
      throw new Error("[Bad Request] alias is required");
    }

    const user = await this.authenticate(alias, password);
    if (user === null) {
      throw new Error("[Bad Request] Invalid alias or password");
    }

    return this.sessionFor(user);
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    const user = await this.factory.userDao.register(
      firstName,
      lastName,
      alias,
      await bcrypt.hash(password, PASSWORD_ROUNDS),
      imageUrl,
    );
    if (user === null) {
      throw new Error("[Bad Request] Invalid registration");
    }

    return this.sessionFor(user);
  }

  public async authorize(token: string): Promise<AuthSession> {
    const session = token.trim()
      ? await this.factory.authTokenDao.get(token)
      : null;

    if (session === null) {
      throw new Error("[Bad Request] User is not authorized");
    }

    return session;
  }

  public async authorizeAlias(
    token: string,
    alias: string,
  ): Promise<AuthSession> {
    const session = await this.authorize(token);
    if (session.alias !== alias) {
      throw new Error("[Bad Request] User is not authorized");
    }

    return session;
  }

  public async logout(token: string): Promise<void> {
    await this.pause(1000);
    await this.factory.authTokenDao.delete(token);
  }

  private async authenticate(
    alias: string,
    password: string,
  ): Promise<User | null> {
    const passwordHash = await this.factory.userDao.findPasswordHash(alias);
    if (passwordHash === null) {
      return null;
    }

    const matches = await bcrypt.compare(password, passwordHash);
    return matches ? this.factory.userDao.findByAlias(alias) : null;
  }

  private async sessionFor(
    user: User,
  ): Promise<[UserDto, AuthTokenDto]> {
    const authToken = await this.factory.authTokenDao.create(user.alias);
    return [user.dto, authToken.dto];
  }
}
