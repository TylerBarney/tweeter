import { User, AuthToken, FakeData } from "tweeter-shared";
import { AuthenticationService } from "../model.service/AuthenticationService";

export interface LoginView {
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean,
  ) => void;
  updateIsLoading: (isLoading: boolean) => void;
}
export class LoginPresenter {
  private view: LoginView;
  private service: AuthenticationService;

  public constructor(view: LoginView) {
    this.view = view;
    this.service = new AuthenticationService();
  }

  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined,
  ) {
    try {
      this.view.updateIsLoading(true);

      const [user, authToken] = await this.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`,
      );
    } finally {
      this.view.updateIsLoading(false);
    }
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<[User, AuthToken]> {
    return this.service.login(alias, password);
  }
}
