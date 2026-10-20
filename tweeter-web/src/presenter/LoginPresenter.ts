import {
  AuthenticationPresenter,
  AuthenticationView,
} from "./AuthenticationPresenter";
export class LoginPresenter extends AuthenticationPresenter<AuthenticationView> {
  public async login(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined,
  ) {
    await this.doAuthenticationOperation(
      () => this.service.login(alias, password),
      rememberMe,
      "log user in",
      originalUrl,
    );
  }
}
