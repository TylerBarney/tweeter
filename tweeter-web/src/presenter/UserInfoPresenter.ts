import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserInfoView {
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string | undefined,
  ) => string;
  displayErrorMessage: (message: string) => string;
  deleteMessage: (message: string) => void;
  navigate: (url: string) => void;
  setFolloweeCount: (followeeCount: number) => void;
  setIsFollower: (isFollower: boolean) => void;
  setFollowerCount: (followerCount: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setDisplayedUser: (user: User) => void;
}

export class UserInfoPresenter {
  private view: UserInfoView;
  private service: UserService;

  public constructor(view: UserInfoView) {
    this.view = view;
    this.service = new UserService();
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    try {
      this.view.setFolloweeCount(
        await this.service.getFolloweeCount(authToken, displayedUser),
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followees count because of exception: ${error}`,
      );
    }
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ) {
    try {
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
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`,
      );
    }
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    try {
      this.view.setFollowerCount(
        await this.service.getFollowerCount(authToken, displayedUser),
      );
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get followers count because of exception: ${error}`,
      );
    }
  }

  public switchToLoggedInUser(currentUser: User, pathname: string): void {
    this.view.setDisplayedUser(currentUser);
    this.view.navigate(`${this.getBaseUrl(pathname)}/${currentUser.alias}`);
  }

  private getBaseUrl(pathname: string): string {
    const segments = pathname.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  }

  public async followDisplayedUser(
    displayedUser: User,
    authToken: AuthToken,
  ): Promise<void> {
    this.followUnfollowDisplayedUser(
      displayedUser,
      authToken,
      true,
      () =>
        this.view.displayInfoMessage(`Following ${displayedUser!.name}...`, 0),
      (error: unknown) =>
        this.view.displayErrorMessage(
          `Failed to follow user because of exception: ${error}`,
        ),
      (authToken, userToFollow) => this.follow(authToken, userToFollow),
    );
  }

  private async follow(
    authToken: AuthToken,
    userToFollow: User,
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the follow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const followerCount = await this.service.getFollowerCount(
      authToken,
      userToFollow,
    );

    const followeeCount = await this.service.getFolloweeCount(
      authToken,
      userToFollow,
    );

    return [followerCount, followeeCount];
  }

  public async unfollowDisplayedUser(
    displayedUser: User,
    authToken: AuthToken,
  ): Promise<void> {
    this.followUnfollowDisplayedUser(
      displayedUser,
      authToken,
      false,
      () =>
        this.view.displayInfoMessage(
          `Unfollowing ${displayedUser!.name}...`,
          0,
        ),
      (error: unknown) =>
        this.view.displayErrorMessage(
          `Failed to unfollow user because of exception: ${error}`,
        ),
      (authToken, userToUnfollow) => this.unfollow(authToken, userToUnfollow),
    );
  }

  private async followUnfollowDisplayedUser(
    displayedUser: User,
    authToken: AuthToken,
    isFollowing: boolean,
    infoToast: () => string,
    errorToast: (error: unknown) => string,
    followUnfollowAction: (
      authToken: AuthToken,
      userToUnfollow: User,
    ) => Promise<[followerCount: number, followeeCount: number]>,
  ) {
    var toast = "";

    try {
      this.view.setIsLoading(true);
      toast = infoToast();

      const [followerCount, followeeCount] = await followUnfollowAction(
        authToken!,
        displayedUser!,
      );

      this.view.setIsFollower(isFollowing);
      this.view.setFollowerCount(followerCount);
      this.view.setFolloweeCount(followeeCount);
    } catch (error) {
      errorToast(error);
    } finally {
      this.view.deleteMessage(toast);
      this.view.setIsLoading(false);
    }
  }

  private async unfollow(
    authToken: AuthToken,
    userToUnfollow: User,
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the unfollow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server

    const followerCount = await this.service.getFollowerCount(
      authToken,
      userToUnfollow,
    );

    const followeeCount = await this.service.getFolloweeCount(
      authToken,
      userToUnfollow,
    );
    return [followerCount, followeeCount];
  }
}
