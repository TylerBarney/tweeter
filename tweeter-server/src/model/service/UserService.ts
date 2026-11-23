// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDto, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { UserDao } from "../dao/UserDao";
import { ImageDao } from "../dao/ImageDao";
import { AuthorizationService } from "./AuthorizationService";

export class UserService extends Service {
  private userDao: UserDao;
  private imageDao: ImageDao;
  private authorization: AuthorizationService;
  public constructor() {
    super();
    this.userDao = this.factory.userDao;
    this.imageDao = this.factory.imageDao;
    this.authorization = new AuthorizationService();
  }
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    const user = await this.userDao.findByAlias(alias);
    return user === null ? null : user.dto;
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
    return this.authorization.register(
      firstName,
      lastName,
      alias,
      password,
      imageUrl,
    );
  }

  public logout(token: string): Promise<void> {
    return this.authorization.logout(token);
  }
}
