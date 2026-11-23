// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDao } from "./AuthTokenDao";
import { FollowDao } from "./FollowDao";
import { ImageDao } from "./ImageDao";
import { StatusDao } from "./StatusDao";
import { UserDao } from "./UserDao";

export abstract class DaoFactory {
  abstract get userDao(): UserDao;

  abstract get authTokenDao(): AuthTokenDao;

  abstract get followDao(): FollowDao;

  abstract get storyDao(): StatusDao;

  abstract get feedDao(): StatusDao;

  abstract get imageDao(): ImageDao;
}
