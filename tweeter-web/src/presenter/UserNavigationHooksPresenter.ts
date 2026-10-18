import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface UserNavigationHooksView {
  setDisplayedUser: (user: User) => void;
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => string;
}

export class UserNavigationHooksPresenter {
  private view: UserNavigationHooksView;
  private service: UserService;

  public constructor(view: UserNavigationHooksView) {
    this.view = view;
    this.service = new UserService();
  }

  public async navigateToUser(
    eventString: string,
    authToken: AuthToken,
    displayedUser: User,
    featurePath: string,
  ): Promise<void> {
    try {
      const alias = this.extractAlias(eventString);

      const toUser = await this.service.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`,
      );
    }
  }

  private extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
