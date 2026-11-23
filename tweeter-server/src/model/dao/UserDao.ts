// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";

export interface UserDao {
  findByAlias(alias: string): Promise<User | null>;

  authenticate(alias: string, password: string): Promise<User | null>;

  register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageUrl: string,
  ): Promise<User | null>;
}
