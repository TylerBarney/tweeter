import { User, AuthToken } from "tweeter-shared";
import { AuthenticationService } from "../model.service/AuthenticationService";

export interface AuthenticationView {
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean,
  ) => void;
  updateIsLoading: (isLoading: boolean) => void;
  setImageUrl?: (url: string) => void;
  setImageFileExtension?: (fileExtension: string) => void;
}

export class AuthenticationPresenter {
  protected view: AuthenticationView;
  private _service: AuthenticationService;

  public constructor(view: AuthenticationView) {
    this.view = view;
    this._service = new AuthenticationService();
  }

  protected get service() {
    return this._service;
  }

  protected async authenticate(
    rememberMe: boolean,
    authenticationType: string,
    auth: () => Promise<[User, AuthToken]>,
    originalUrl?: string | undefined,
  ): Promise<void> {
    try {
      this.view.updateIsLoading(true);

      const [user, authToken] = await auth();

      this.view.updateUserInfo(user, user, authToken, rememberMe);
      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to ${authenticationType} user because of exception: ${error}`,
      );
    } finally {
      this.view.updateIsLoading(false);
    }
  }
}
