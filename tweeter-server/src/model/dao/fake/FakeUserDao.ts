// AI-assisted: see AI-ATTRIBUTION.md
import { User } from "tweeter-shared";
import { UserDao } from "../UserDao";
import { FakeDao } from "./FakeDao";

export class FakeUserDao extends FakeDao implements UserDao {
  public async findByAlias(alias: string): Promise<User | null> {
    return this.data.findUserByAlias(alias);
  }

  public async authenticate(
    _alias: string,
    _password: string,
  ): Promise<User | null> {
    return this.data.firstUser;
  }

  public async register(
    _firstName: string,
    _lastName: string,
    _alias: string,
    _password: string,
    _imageUrl: string,
  ): Promise<User | null> {
    return this.data.firstUser;
  }
}
