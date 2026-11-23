// AI-assisted: see AI-ATTRIBUTION.md
import bcrypt from "bcryptjs";
import { AuthToken, AuthTokenDto, User, UserDto } from "tweeter-shared";
import { badRequest } from "../apiError";
import { AuthSession, AuthTokenDao } from "../dao/AuthTokenDao";
import { Service } from "./Service";
import { UserDao } from "../dao/UserDao";

const PASSWORD_ROUNDS = 10;
const SESSION_SECONDS = 30 * 60;

export class AuthorizationService extends Service {
  private userDao: UserDao;
  private authTokenDao: AuthTokenDao;
  public constructor() {
    super();
    this.userDao = this.factory.userDao;
    this.authTokenDao = this.factory.authTokenDao;
  }
  public async login(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    if (typeof alias !== "string" || alias.trim().length === 0) {
      badRequest("alias is required");
    }

    const user = await this.authenticate(alias, password);
    if (user === null) {
      badRequest("Invalid alias or password");
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
    const user = await this.userDao.register(
      firstName,
      lastName,
      alias,
      await bcrypt.hash(password, PASSWORD_ROUNDS),
      imageUrl,
    );
    if (user === null) {
      badRequest("User already registered");
    }

    return this.sessionFor(user);
  }

  public async authorize(token: string): Promise<AuthSession> {
    const session = await this.currentSession(token);
    if (session === null) {
      badRequest("User is not authorized");
    }

    return this.renew(token, session.alias);
  }

  public async authorizeAlias(
    token: string,
    alias: string,
  ): Promise<AuthSession> {
    const session = await this.authorize(token);
    if (session.alias !== alias) {
      badRequest("User is not authorized");
    }

    return session;
  }

  public async logout(token: string): Promise<void> {
    await this.authTokenDao.delete(token);
  }

  private async authenticate(
    alias: string,
    password: string,
  ): Promise<User | null> {
    const credentials = await this.userDao.findByAliasWithPassword(alias);
    if (credentials === null) {
      return null;
    }

    const matches = await bcrypt.compare(password, credentials.passwordHash);
    return matches ? credentials.user : null;
  }

  private async sessionFor(user: User): Promise<[UserDto, AuthTokenDto]> {
    const authToken = AuthToken.Generate();
    const created = await this.authTokenDao.create(
      authToken,
      user.alias,
      this.expiresAt(authToken.timestamp),
    );
    if (!created) {
      throw new Error("[Server Error] Could not create an auth token");
    }

    return [user.dto, authToken.dto];
  }

  private async currentSession(token: string): Promise<AuthSession | null> {
    if (typeof token !== "string" || token.trim().length === 0) {
      return null;
    }

    const record = await this.authTokenDao.get(token);
    if (record === null || this.isExpired(record.expiresAt)) {
      return null;
    }

    return { authToken: record.authToken, alias: record.alias };
  }

  private expiresAt(timestamp: number): number {
    return Math.floor(timestamp / 1000) + SESSION_SECONDS;
  }

  private isExpired(expiresAt: number): boolean {
    return expiresAt <= Math.floor(Date.now() / 1000);
  }

  private async renew(token: string, alias: string): Promise<AuthSession> {
    const timestamp = Date.now();
    const renewed = await this.authTokenDao.renew(
      token,
      timestamp,
      this.expiresAt(timestamp),
    );
    if (!renewed) {
      badRequest("User is not authorized");
    }

    return {
      authToken: new AuthToken(token, timestamp),
      alias,
    };
  }
}
