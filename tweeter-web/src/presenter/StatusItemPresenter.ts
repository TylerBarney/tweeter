import { Status, AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export const PAGE_SIZE = 10;

export interface StatusItemView {
  addItems: (newItems: Status[]) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class StatusItemPresenter {
  private userService: UserService;
  private _view: StatusItemView;
  private _lastItem: Status | null = null;
  private _hasMoreItems = true;

  public constructor(view: StatusItemView) {
    this._view = view;
    this.userService = new UserService();
  }

  public async getUser(
    authToken: AuthToken,
    alias: string,
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

  public async reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public get view() {
    return this._view;
  }

  public get hasMoreItems() {
    return this._hasMoreItems;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected get lastItem() {
    return this._lastItem;
  }

  protected set lastItem(value: Status | null) {
    this._lastItem = value;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}
