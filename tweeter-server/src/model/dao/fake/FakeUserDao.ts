// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { UserCredentials, UserDao } from "../UserDao";
import { FakeDao } from "./FakeDao";

export class FakeUserDao extends FakeDao implements UserDao {
  public async findByAlias(alias: string): Promise<User | null> {
    return this.data.findUserByAlias(alias);
  }

  public async findByAliasWithPassword(
    _alias: string,
  ): Promise<UserCredentials | null> {
    return null;
  }

  public async register(
    _firstName: string,
    _lastName: string,
    _alias: string,
    _passwordHash: string,
    _imageUrl: string,
  ): Promise<User | null> {
    return this.data.firstUser;
  }
}
