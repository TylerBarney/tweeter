import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface UserNavigationHooksView extends View {
  setDisplayedUser: (user: User) => void;
  navigate: (url: string) => void;
}

export class UserNavigationHooksPresenter extends Presenter<UserNavigationHooksView> {
  private service: UserService = new UserService();

  public async navigateToUser(
    eventString: string,
    authToken: AuthToken,
    displayedUser: User,
    featurePath: string,
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(eventString);

      const toUser = await this.service.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  private extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
