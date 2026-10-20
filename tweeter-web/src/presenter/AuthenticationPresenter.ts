import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";
export interface AuthenticationView extends View {
  authenticated: (
    user: User,
    authToken: AuthToken,
    rememberMe: boolean,
  ) => void;
  navigate: (url: string) => void;
}
export abstract class AuthenticationPresenter<
  V extends AuthenticationView,
> extends Presenter<V> {
  private _service = new UserService();

  protected get service() {
    return this._service;
  }
  protected async doAuthenticationOperation(
    authOperation: () => Promise<[User, AuthToken]>,
    rememberMe: boolean,
    operationDescription: string,
    originalUrl?: string,
  ) {
    await this.doFailureReportingOperation(async () => {
      const [user, authToken] = await authOperation();
      this.view.authenticated(user, authToken, rememberMe);
      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    }, operationDescription);
  }
}
