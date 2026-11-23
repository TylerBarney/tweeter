// AI-assisted: see AI-ATTRIBUTION.md
import { User, UserDto } from "tweeter-shared";
import { DataPage } from "../dao/DataPage";
import { Service } from "./Service";
import { FollowDao } from "../dao/FollowDao";
import { AuthTokenDao } from "../dao/AuthTokenDao";

export class FollowService extends Service {
  private followDao: FollowDao;
  private authTokenDao: AuthTokenDao;
  constructor() {
    super();
    this.followDao = this.factory.followDao;
    this.authTokenDao = this.factory.authTokenDao;
  }
  public loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<[UserDto[], boolean]> {
    return this.loadUsers(
      (alias, size, lastUser) =>
        this.followDao.getFollowees(alias, size, lastUser),
      userAlias,
      pageSize,
      lastItem,
    );
  }

  public loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<[UserDto[], boolean]> {
    return this.loadUsers(
      (alias, size, lastUser) =>
        this.followDao.getFollowers(alias, size, lastUser),
      userAlias,
      pageSize,
      lastItem,
    );
  }

  public async follow(
    token: string,
    userToFollow: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.changeFollow(
      token,
      userToFollow,
      (followerAlias, followeeAlias) =>
        this.followDao.follow(followerAlias, followeeAlias),
    );
  }

  public async unfollow(
    token: string,
    user: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.changeFollow(token, user, (followerAlias, followeeAlias) =>
      this.followDao.unfollow(followerAlias, followeeAlias),
    );
  }

  public getFolloweeCount(token: string, user: UserDto): Promise<number> {
    return this.followDao.getFolloweeCount(user.alias);
  }

  public getFollowerCount(token: string, user: UserDto): Promise<number> {
    return this.followDao.getFollowerCount(user.alias);
  }

  public getIsFollowerStatus(
    token: string,
    user: UserDto,
    selectedUser: UserDto,
  ): Promise<boolean> {
    return this.followDao.isFollower(user.alias, selectedUser.alias);
  }

  private loadUsers(
    load: (
      alias: string,
      pageSize: number,
      lastUser: User | null,
    ) => Promise<DataPage<User>>,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null,
  ): Promise<[UserDto[], boolean]> {
    return this.loadPage(
      () => load(userAlias, pageSize, User.fromDto(lastItem)),
      (user) => user.dto,
    );
  }

  private async changeFollow(
    token: string,
    user: UserDto,
    update: (followerAlias: string, followeeAlias: string) => Promise<void>,
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.pause(2000);
    const session = await this.authTokenDao.get(token);
    if (session !== null) {
      await update(session.alias, user.alias);
    }
    return this.countsFor(user);
  }

  private async countsFor(
    user: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    const followerCount = await this.followDao.getFollowerCount(user.alias);
    const followeeCount = await this.followDao.getFolloweeCount(user.alias);
    return [followerCount, followeeCount];
  }
}
