// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDto, User, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { UserDao } from "../dao/UserDao";
import { ImageDao } from "../dao/ImageDao";
import { AuthTokenDao } from "../dao/AuthTokenDao";

export class UserService extends Service {
  private userDao: UserDao;
  private imageDao: ImageDao;
  private authTokenDao: AuthTokenDao;
  public constructor() {
    super();
    this.userDao = this.factory.userDao;
    this.imageDao = this.factory.imageDao;
    this.authTokenDao = this.factory.authTokenDao;
  }
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    const user = await this.userDao.findByAlias(alias);
    return user === null ? null : user.dto;
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    if (!alias.trim()) {
      throw new Error("[Bad Request] alias is required");
    }

    const user = await this.userDao.authenticate(alias, password);
    return this.userAndToken(user, "[Bad Request] Invalid alias or password");
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    const imageUrl = await this.imageDao.putImage(
      `${alias}.${imageFileExtension}`,
      userImageBytes,
    );
    const user = await this.factory.userDao.register(
      firstName,
      lastName,
      alias,
      password,
      imageUrl,
    );
    return this.userAndToken(user, "[Bad Request] Invalid registration");
  }

  public async logout(token: string): Promise<void> {
    await this.pause(1000);
    await this.authTokenDao.delete(token);
  }

  private async userAndToken(
    user: User | null,
    failureMessage: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    if (user === null) {
      throw new Error(failureMessage);
    }

    const authToken = await this.authTokenDao.create(user.alias);
    return [user.dto, authToken.dto];
  }
}
