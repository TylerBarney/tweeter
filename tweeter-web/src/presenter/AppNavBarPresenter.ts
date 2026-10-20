import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { MessagePresenter, MessageView } from "./MessagePresenter";

export interface AppNavBarView extends MessageView {
  clearUserInfo: () => void;
  navigate: (url: string) => void;
}

export class AppNavBarPresenter extends MessagePresenter<AppNavBarView> {
  private service: UserService = new UserService();

  public async logOut(authToken: AuthToken) {
    await this.doInfoMessageOperation(
      "Logging Out...",
      async () => {
        await this.service.logout(authToken!);

        this.view.clearUserInfo();
        this.view.navigate("/login");
      },
      "log user out",
    );
  }
}
