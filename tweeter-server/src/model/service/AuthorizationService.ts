// AI-assisted: see AI-ATTRIBUTION.md
import bcrypt from "bcryptjs";
import { AuthTokenDto, User, UserDto } from "tweeter-shared";
import { AuthSession, AuthTokenDao } from "../dao/AuthTokenDao";
import { Service } from "./Service";
import { UserDao } from "../dao/UserDao";

const PASSWORD_ROUNDS = 10;

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
    const user = await this.userDao.register(
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
    const session = token.trim() ? await this.authTokenDao.get(token) : null;

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
    await this.authTokenDao.delete(token);
  }

  private async authenticate(
    alias: string,
    password: string,
  ): Promise<User | null> {
    const passwordHash = await this.userDao.findPasswordHash(alias);
    if (passwordHash === null) {
      return null;
    }

    const matches = await bcrypt.compare(password, passwordHash);
    return matches ? this.userDao.findByAlias(alias) : null;
  }

  private async sessionFor(user: User): Promise<[UserDto, AuthTokenDto]> {
    const authToken = await this.authTokenDao.create(user.alias);
    return [user.dto, authToken.dto];
  }
}
