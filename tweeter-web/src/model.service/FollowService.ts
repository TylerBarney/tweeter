// AI-assisted: see AI-ATTRIBUTION.md
import {
  AuthToken,
  FollowRequest,
  PagedUserItemRequest,
  User,
} from "tweeter-shared";
import { Service } from "./Service";

export class FollowService extends Service {
  public loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
  ): Promise<[User[], boolean]> {
    return this.loadMoreUsers(
      authToken,
      userAlias,
      pageSize,
      lastItem,
      (request) => this.serverFacade.getMoreFollowees(request),
    );
  }

  public loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
  ): Promise<[User[], boolean]> {
    return this.loadMoreUsers(
      authToken,
      userAlias,
      pageSize,
      lastItem,
      (request) => this.serverFacade.getMoreFollowers(request),
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

  private loadMoreUsers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null,
    loadPage: (request: PagedUserItemRequest) => Promise<[User[], boolean]>,
  ): Promise<[User[], boolean]> {
    return loadPage({
      token: authToken.token,
      userAlias,
      pageSize,
      lastItem: lastItem === null ? null : lastItem.dto,
    });
  }

  private followRequest(authToken: AuthToken, user: User): FollowRequest {
    return {
      token: authToken.token,
      user: user.dto,
    };
  }
}
