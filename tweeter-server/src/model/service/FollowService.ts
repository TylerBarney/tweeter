// AI-assisted: see AI-ATTRIBUTION.md
import { User, UserDto } from "tweeter-shared";
import { badRequest } from "../apiError";
import { DataPage } from "../dao/DataPage";
import { FollowDao, FollowWriteResult } from "../dao/FollowDao";
import { Service } from "./Service";

export class FollowService extends Service {
  private followDao: FollowDao;
  constructor() {
    super();
    this.followDao = this.factory.followDao;
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
    followerAlias: string,
    userToFollow: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.changeFollow(
      followerAlias,
      userToFollow,
      (follower, followee) => this.followDao.follow(follower, followee),
    );
  }

  public async unfollow(
    followerAlias: string,
    user: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.changeFollow(followerAlias, user, (follower, followee) =>
      this.followDao.unfollow(follower, followee),
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
    followerAlias: string,
    user: UserDto,
    update: (
      followerAlias: string,
      followeeAlias: string,
    ) => Promise<FollowWriteResult>,
  ): Promise<[followerCount: number, followeeCount: number]> {
    if (followerAlias === user.alias) {
      badRequest("A user cannot follow themselves");
    }

    await this.pause(2000);
    const result = await update(followerAlias, user.alias);
    this.requireFollowWrite(result);
    return this.countsFor(user);
  }

  private requireFollowWrite(result: FollowWriteResult): void {
    switch (result) {
      case "ok":
        return;
      case "already-following":
        badRequest("Already following this user");
      case "not-following":
        badRequest("Not following this user");
      case "missing-user":
        badRequest("User not found");
    }
  }

  private async countsFor(
    user: UserDto,
  ): Promise<[followerCount: number, followeeCount: number]> {
    const counts = await this.followDao.getFollowCounts(user.alias);
    return [counts.followerCount, counts.followeeCount];
  }
}
