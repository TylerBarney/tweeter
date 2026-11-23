// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { DataPage } from "../DataPage";
import { FollowDao } from "../FollowDao";
import { FakeDao } from "./FakeDao";

export class FakeFollowDao extends FakeDao implements FollowDao {
  public async getFollowees(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): Promise<DataPage<User>> {
    return this.pageOfUsers(alias, pageSize, lastUser);
  }

  public async getFollowers(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): Promise<DataPage<User>> {
    return this.pageOfUsers(alias, pageSize, lastUser);
  }

  public async isFollower(
    _followerAlias: string,
    _followeeAlias: string,
  ): Promise<boolean> {
    return this.data.isFollower();
  }

  public async follow(
    _followerAlias: string,
    _followeeAlias: string,
  ): Promise<void> {}

  public async unfollow(
    _followerAlias: string,
    _followeeAlias: string,
  ): Promise<void> {}

  public async getFollowerCount(alias: string): Promise<number> {
    return this.data.getFollowerCount(alias);
  }

  public async getFolloweeCount(alias: string): Promise<number> {
    return this.data.getFolloweeCount(alias);
  }

  private pageOfUsers(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): DataPage<User> {
    return this.page(this.data.getPageOfUsers(lastUser, pageSize, alias));
  }
}
