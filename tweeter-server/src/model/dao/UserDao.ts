// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";

export interface UserCredentials {
  readonly user: User;
  readonly passwordHash: string;
}

export interface UserDao {
  findByAlias(alias: string): Promise<User | null>;

  findByAliasWithPassword(alias: string): Promise<UserCredentials | null>;

  register(
    firstName: string,
    lastName: string,
    alias: string,
    passwordHash: string,
    imageUrl: string,
  ): Promise<User | null>;
}
