// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";

export interface UserDao {
  findByAlias(alias: string): Promise<User | null>;

  findPasswordHash(alias: string): Promise<string | null>;

  register(
    firstName: string,
    lastName: string,
    alias: string,
    passwordHash: string,
    imageUrl: string,
  ): Promise<User | null>;
}
