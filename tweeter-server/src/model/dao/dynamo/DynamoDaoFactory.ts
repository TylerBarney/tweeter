// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDao } from "../AuthTokenDao";
import { DaoFactory } from "../DaoFactory";
import { FollowDao } from "../FollowDao";
import { ImageDao } from "../ImageDao";
import { StatusDao } from "../StatusDao";
import { UserDao } from "../UserDao";
import { DynamoAuthTokenDao } from "./DynamoAuthTokenDao";
import { DynamoFeedDao } from "./DynamoFeedDao";
import { DynamoFollowDao } from "./DynamoFollowDao";
import { DynamoStoryDao } from "./DynamoStoryDao";
import { DynamoUserDao } from "./DynamoUserDao";
import { S3ImageDao } from "./S3ImageDao";
import { lazy } from "./lazy";

export class DynamoDaoFactory extends DaoFactory {
  private readonly users = lazy(() => new DynamoUserDao());
  private readonly sessions = lazy(() => new DynamoAuthTokenDao());
  private readonly follows = lazy(() => new DynamoFollowDao());
  private readonly stories = lazy(() => new DynamoStoryDao());
  private readonly feeds = lazy(() => new DynamoFeedDao());
  private readonly images = lazy(() => new S3ImageDao());

  public get userDao(): UserDao {
    return this.users();
  }

  public get authTokenDao(): AuthTokenDao {
    return this.sessions();
  }

  public get followDao(): FollowDao {
    return this.follows();
  }

  public get storyDao(): StatusDao {
    return this.stories();
  }

  public get feedDao(): StatusDao {
    return this.feeds();
  }

  public get imageDao(): ImageDao {
    return this.images();
  }
}
