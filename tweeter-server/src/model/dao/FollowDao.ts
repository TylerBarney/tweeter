// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { DataPage } from "./DataPage";

export type FollowWriteResult =
  | "ok"
  | "already-following"
  | "not-following"
  | "missing-user";

export interface FollowCounts {
  readonly followerCount: number;
  readonly followeeCount: number;
}

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

  follow(
    followerAlias: string,
    followeeAlias: string,
  ): Promise<FollowWriteResult>;

  unfollow(
    followerAlias: string,
    followeeAlias: string,
  ): Promise<FollowWriteResult>;

  getFollowerCount(alias: string): Promise<number>;

  getFolloweeCount(alias: string): Promise<number>;

  getFollowCounts(alias: string): Promise<FollowCounts>;
}
