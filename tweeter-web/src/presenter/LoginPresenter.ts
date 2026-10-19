import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface LoginView {
  displayErrorMessage: (message: string) => void;
  authenticated: (
    user: User,
    authToken: AuthToken,
    rememberMe: boolean,
  ) => void;
  navigate: (url: string) => void;
}
export class LoginPresenter {
  private view: LoginView;
  private service: UserService = new UserService();

  public constructor(view: LoginView) {
    this.view = view;
  }
  public async login(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined,
  ) {
    try {
      const [user, authToken] = await this.service.login(alias, password);

      this.view.authenticated(user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`,
      );
    }
  }
}
