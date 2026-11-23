// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDao } from "../AuthTokenDao";
import { DaoFactory } from "../DaoFactory";
import { FollowDao } from "../FollowDao";
import { ImageDao } from "../ImageDao";
import { StatusDao } from "../StatusDao";
import { UserDao } from "../UserDao";
import { FakeAuthTokenDao } from "./FakeAuthTokenDao";
import { FakeFollowDao } from "./FakeFollowDao";
import { FakeImageDao } from "./FakeImageDao";
import { FakeStatusDao } from "./FakeStatusDao";
import { FakeUserDao } from "./FakeUserDao";

export class FakeDaoFactory extends DaoFactory {
  private readonly users = new FakeUserDao();
  private readonly sessions = new FakeAuthTokenDao();
  private readonly follows = new FakeFollowDao();
  private readonly stories = new FakeStatusDao();
  private readonly feeds = new FakeStatusDao();
  private readonly images = new FakeImageDao();

  public get userDao(): UserDao {
    return this.users;
  }

  public get authTokenDao(): AuthTokenDao {
    return this.sessions;
  }

  public get followDao(): FollowDao {
    return this.follows;
  }

  public get storyDao(): StatusDao {
    return this.stories;
  }

  public get feedDao(): StatusDao {
    return this.feeds;
  }

  public get imageDao(): ImageDao {
    return this.images;
  }
}
