// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { DataPage } from "./DataPage";

export interface FollowDao {
  getFollowees(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): Promise<DataPage<User>>;

  getFollowers(
    alias: string,
    pageSize: number,
    lastUser: User | null,
  ): Promise<DataPage<User>>;

  getFollowerAliases(alias: string): Promise<string[]>;

  isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;

  follow(followerAlias: string, followeeAlias: string): Promise<void>;

  unfollow(followerAlias: string, followeeAlias: string): Promise<void>;

  getFollowerCount(alias: string): Promise<number>;

  getFolloweeCount(alias: string): Promise<number>;
}
