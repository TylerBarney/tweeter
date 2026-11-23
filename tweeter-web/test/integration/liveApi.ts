// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken, User } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import { CreatedUser, deleteCreatedUsers } from "./cleanup";

export const PAGE_SIZE = 2;
const IMAGE_EXTENSION = "png";

export type RegisteredUser = {
  user: User;
  authToken: AuthToken;
};

export type LiveApi = {
  serverFacade: ServerFacade;
  registerUser(
    userAlias: string,
    firstName?: string,
    lastName?: string,
  ): Promise<RegisteredUser>;
  cleanup(): Promise<void>;
};

export function createLiveApi(serverFacade = new ServerFacade()): LiveApi {
  const created: CreatedUser[] = [];

  return {
    serverFacade,
    async registerUser(userAlias, firstName = "Test", lastName = "User") {
      const [user, authToken] = await serverFacade.register({
        firstName,
        lastName,
        alias: userAlias,
        password: "password",
        userImageBytes: "aGVsbG8=",
        imageFileExtension: IMAGE_EXTENSION,
      });
      created.push({
        alias: user.alias,
        token: authToken.token,
        imageUrl: user.imageUrl,
      });
      return { user, authToken };
    },
    cleanup() {
      return deleteCreatedUsers(created.splice(0));
    },
  };
}

export function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function alias(label: string, suffix: string): string {
  return `@${label}${suffix}`;
}

export function describeUser(user: User): string {
  return `${user.name} ${user.alias} ${user.imageUrl}`;
}
