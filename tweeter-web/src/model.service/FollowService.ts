// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken, User } from "tweeter-shared";
import { Service } from "./Service";

export class FollowService extends Service {
  public loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
  ): Promise<[User[], boolean]> {
    return this.serverFacade.getMoreFollowees(
      this.pagedRequest(authToken, userAlias, pageSize, lastItem),
    );
  }

  public loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
  ): Promise<[User[], boolean]> {
    return this.serverFacade.getMoreFollowers(
      this.pagedRequest(authToken, userAlias, pageSize, lastItem),
    );
  }

  public follow(
    authToken: AuthToken,
    userToFollow: User,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.serverFacade.follow(this.followRequest(authToken, userToFollow));
  }

  public unfollow(
    authToken: AuthToken,
    userToUnfollow: User,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.serverFacade.unfollow(
      this.followRequest(authToken, userToUnfollow),
    );
  }

  public getFolloweeCount(authToken: AuthToken, user: User): Promise<number> {
    return this.serverFacade.getFolloweeCount(
      this.followRequest(authToken, user),
    );
  }

  public getFollowerCount(authToken: AuthToken, user: User): Promise<number> {
    return this.serverFacade.getFollowerCount(
      this.followRequest(authToken, user),
    );
  }

  public getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User,
  ): Promise<boolean> {
    return this.serverFacade.getIsFollowerStatus({
      ...this.followRequest(authToken, user),
      selectedUser: selectedUser.dto,
    });
  }

  private followRequest(authToken: AuthToken, user: User) {
    return {
      token: authToken.token,
      user: user.dto,
    };
  }
}
