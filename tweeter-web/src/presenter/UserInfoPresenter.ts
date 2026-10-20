import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessagePresenter, MessageView } from "./MessagePresenter";

export interface UserInfoView extends MessageView {
  navigate: (url: string) => void;
  setFolloweeCount: (followeeCount: number) => void;
  setIsFollower: (isFollower: boolean) => void;
  setFollowerCount: (followerCount: number) => void;
  setDisplayedUser: (user: User) => void;
}

export class UserInfoPresenter extends MessagePresenter<UserInfoView> {
  private service: FollowService = new FollowService();

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ) {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.service.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!,
          ),
        );
      }
    }, "determine follower status");
  }

  private async doCountOperation(
    getCount: () => Promise<number>,
    setCount: (count: number) => void,
    operationDescription: string,
  ) {
    await this.doFailureReportingOperation(async () => {
      setCount(await getCount());
    }, operationDescription);
  }

  public async getFolloweeCount(authToken: AuthToken, user: User) {
    await this.doCountOperation(
      () => this.service.getFolloweeCount(authToken, user),
      (count) => this.view.setFolloweeCount(count),
      "get followees count",
    );
  }
  public async getFollowerCount(authToken: AuthToken, displayedUser: User) {
    await this.doCountOperation(
      () => this.service.getFollowerCount(authToken, displayedUser),
      (count) => this.view.setFollowerCount(count),
      "get followers count",
    );
  }

  public async followUser(
    authToken: AuthToken,
    userToFollow: User,
  ): Promise<void> {
    await this.doFollowOperation(
      userToFollow,
      true,
      "Following",
      "follow user",
      () => this.service.follow(authToken, userToFollow),
    );
  }

  public async unfollowUser(
    authToken: AuthToken,
    userToUnfollow: User,
  ): Promise<void> {
    await this.doFollowOperation(
      userToUnfollow,
      false,
      "Unfollowing",
      "unfollow user",
      () => this.service.unfollow(authToken, userToUnfollow),
    );
  }

  private async doFollowOperation(
    user: User,
    isFollower: boolean,
    toastDescription: string,
    operationDescription: string,
    followOperation: () => Promise<[number, number]>,
  ) {
    await this.doInfoMessageOperation(
      `${toastDescription} ${user!.name}...`,
      async () => {
        const [followerCount, followeeCount] = await followOperation();
        this.view.setIsFollower(isFollower);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
      },
      operationDescription,
    );
  }

  public switchToLoggedInUser(currentUser: User, pathname: string): void {
    this.view.setDisplayedUser(currentUser);
    this.view.navigate(`${this.getBaseUrl(pathname)}/${currentUser.alias}`);
  }

  private getBaseUrl(pathname: string): string {
    const segments = pathname.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  }
}
