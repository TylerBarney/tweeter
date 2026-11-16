// AI-assisted: see AI-ATTRIBUTION.md
import { AuthTokenDto, FakeData, UserDto } from "tweeter-shared";
import { Service } from "./Service";

export class UserService implements Service {
  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server
    const user = FakeData.instance.findUserByAlias(alias);
    return user === null ? null : user.dto;
  }

  public async login(
    alias: string,
    password: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    if (!alias.trim()) {
      throw new Error("[Bad Request] alias is required");
    }

    // TODO: Replace with the result of calling the server
    return this.firstUserAndToken("Invalid alias or password");
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string,
  ): Promise<[UserDto, AuthTokenDto]> {
    // TODO: Replace with the result of calling the server
    return this.firstUserAndToken("Invalid registration");
  }

  private firstUserAndToken(failureMessage: string): [UserDto, AuthTokenDto] {
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error(failureMessage);
    }

    return [user.dto, FakeData.instance.authToken.dto];
  }

  public async logout(token: string): Promise<void> {
    // Pause so we can see the logging out message. Delete when the call to the server is implemented.
    await new Promise((res) => setTimeout(res, 1000));
  }
}
