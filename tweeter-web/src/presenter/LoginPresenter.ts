import { AuthenticationPresenter } from "./AuthenticationPresenter";
export class LoginPresenter extends AuthenticationPresenter {
  public async login(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined,
  ) {
    super.authenticate(
      rememberMe,
      "log in",
      async () => this.service.login(alias, password),
      originalUrl,
    );
  }
}
