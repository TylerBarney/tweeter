// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDto, UserDto } from "tweeter-shared";
import { badRequest } from "../apiError";
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
    if (
      [firstName, lastName, alias, password].some(
        (value) => typeof value !== "string" || value.trim().length === 0,
      )
    ) {
      badRequest("First name, last name, alias, and password are required");
    }

    const image = Buffer.from(userImageBytes, "base64");
    if (
      image.length === 0 ||
      typeof imageFileExtension !== "string" ||
      imageFileExtension.trim().length === 0
    ) {
      badRequest("A profile image is required");
    }

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
