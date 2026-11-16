// AI-assisted: see AI-ATTRIBUTION.md
import {
  AuthToken,
  AuthenticationResponse,
  FollowCountResponse,
  FollowRequest,
  FollowResponse,
  FollowerStatusRequest,
  FollowerStatusResponse,
  LoginRequest,
  PagedItemRequest,
  PagedItemResponse,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  PagedUserStatusItemRequest,
  PostStatusRequest,
  RegisterRequest,
  Status,
  StatusDto,
  TokenRequest,
  TweeterRequest,
  TweeterResponse,
  User,
  UserDto,
  UserRequest,
  UserResponse,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private readonly SERVER_URL =
    "https://dzsvmoov9b.execute-api.us-east-1.amazonaws.com/dev";

  private readonly clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest,
  ): Promise<[User[], boolean]> {
    return this.loadPage<UserDto, User, PagedUserItemResponse>(
      request,
      "/followee/list",
      (dto) => User.fromDto(dto),
      "No followees found",
    );
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest,
  ): Promise<[User[], boolean]> {
    return this.loadPage<UserDto, User, PagedUserItemResponse>(
      request,
      "/follower/list",
      (dto) => User.fromDto(dto),
      "No followers found",
    );
  }

  public async getMoreStoryItems(
    request: PagedUserStatusItemRequest,
  ): Promise<[Status[], boolean]> {
    return this.loadPage<StatusDto, Status, PagedStatusItemResponse>(
      request,
      "/stories/list",
      (dto) => Status.fromDto(dto),
      "No story items found",
    );
  }

  public async getMoreFeedItems(
    request: PagedUserStatusItemRequest,
  ): Promise<[Status[], boolean]> {
    return this.loadPage<StatusDto, Status, PagedStatusItemResponse>(
      request,
      "/feed/list",
      (dto) => Status.fromDto(dto),
      "No feed items found",
    );
  }

  public async postStatus(request: PostStatusRequest): Promise<void> {
    await this.post<PostStatusRequest, TweeterResponse>(
      request,
      "/status/post",
    );
  }

  public async getFolloweeCount(request: FollowRequest): Promise<number> {
    return this.count(request, "/followee/count");
  }

  public async getFollowerCount(request: FollowRequest): Promise<number> {
    return this.count(request, "/follower/count");
  }

  public async follow(
    request: FollowRequest,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.updateRelationship(request, "/follow");
  }

  public async unfollow(
    request: FollowRequest,
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.updateRelationship(request, "/unfollow");
  }

  public async getIsFollowerStatus(
    request: FollowerStatusRequest,
  ): Promise<boolean> {
    const response = await this.post<
      FollowerStatusRequest,
      FollowerStatusResponse
    >(request, "/follower/status");
    return response.isFollower;
  }

  public async getUser(request: UserRequest): Promise<User | null> {
    const response = await this.post<UserRequest, UserResponse>(
      request,
      "/user/get",
    );
    return User.fromDto(response.user);
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.post<LoginRequest, AuthenticationResponse>(
      request,
      "/user/login",
    );
    return this.authenticatedUser(response);
  }

  public async register(
    request: RegisterRequest,
  ): Promise<[User, AuthToken]> {
    const response = await this.post<RegisterRequest, AuthenticationResponse>(
      request,
      "/user/register",
    );
    return this.authenticatedUser(response);
  }

  public async logout(request: TokenRequest): Promise<void> {
    await this.post<TokenRequest, TweeterResponse>(request, "/user/logout");
  }

  private async loadPage<DTO, ITEM, RES extends PagedItemResponse<DTO>>(
    request: PagedItemRequest<DTO>,
    endpoint: string,
    fromDto: (dto: DTO) => ITEM | null,
    emptyMessage: string,
  ): Promise<[ITEM[], boolean]> {
    const response = await this.post<PagedItemRequest<DTO>, RES>(
      request,
      endpoint,
    );

    if (response.items == null) {
      throw new Error(emptyMessage);
    }

    return [
      response.items.map((dto) => fromDto(dto) as ITEM),
      response.hasMore,
    ];
  }

  private async count(
    request: FollowRequest,
    endpoint: string,
  ): Promise<number> {
    const response = await this.post<FollowRequest, FollowCountResponse>(
      request,
      endpoint,
    );
    return response.count;
  }

  private async updateRelationship(
    request: FollowRequest,
    endpoint: string,
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.post<FollowRequest, FollowResponse>(
      request,
      endpoint,
    );
    return [response.followerCount, response.followeeCount];
  }

  private authenticatedUser(
    response: AuthenticationResponse,
  ): [User, AuthToken] {
    const user = User.fromDto(response.user);
    const authToken = AuthToken.fromDto(response.authToken);

    if (user === null || authToken === null) {
      throw new Error("Invalid authentication response");
    }

    return [user, authToken];
  }

  private async post<REQ extends TweeterRequest, RES extends TweeterResponse>(
    request: REQ,
    endpoint: string,
  ): Promise<RES> {
    const response = await this.clientCommunicator.doPost<REQ, RES>(
      request,
      endpoint,
    );

    if (response.success) {
      return response;
    }

    console.error(response);
    throw new Error(response.message ?? undefined);
  }
}
