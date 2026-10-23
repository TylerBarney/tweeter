import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { MessagePresenter, MessageView } from "./MessagePresenter";

export interface AppNavBarView extends MessageView {
  clearUserInfo: () => void;
  navigate: (url: string) => void;
}

export class AppNavBarPresenter extends MessagePresenter<AppNavBarView> {
  private _service: UserService = new UserService();

  public get service() {
    return this._service;
  }
  public async logOut(authToken: AuthToken) {
    await this.doFailureReportingOperation(async () => {
      const loggingOutToastId = this.view.displayInfoMessage(
        "Logging Out...",
        0,
      );
      await this.service.logout(authToken);
      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    }, "log user out");
  }
}
