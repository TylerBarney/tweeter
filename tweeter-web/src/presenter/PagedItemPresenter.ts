import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { View, Presenter } from "./Presenter";
import { Service } from "../model.service/Service";
export interface PagedItemView<T> extends View {
  addItems: (newItems: T[]) => void;
}

export const PAGE_SIZE = 10;
//Using Generics allows you to remove duplicate code by removing code whose only difference is
// the type being acted on. In this case we removed duplicate code between UserItemPresenter and StatusItemPresenter by using a generic type
// which was either User or Status. In this case we also pass in service type generics.
export abstract class PagedItemPresenter<
  T,
  U extends Service,
> extends Presenter<PagedItemView<T>> {
  private _lastItem: T | null = null;
  private _hasMoreItems = true;
  private _service: U;
  private userService: UserService = new UserService();

  public constructor(view: PagedItemView<T>) {
    super(view);
    this._service = this.serviceFactory();
  }

  protected get lastItem() {
    return this._lastItem;
  }

  protected set lastItem(value: T | null) {
    this._lastItem = value;
  }

  public get hasMoreItems() {
    return this._hasMoreItems;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected get service() {
    return this._service;
  }

  public reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string,
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

  public async loadMoreItems(authToken: AuthToken, alias: string) {
    await this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.getMoreItems(authToken, alias);
      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, this.itemDescription());
  }

  //Template Method lets children classes define functionality that may differ from child to child but fits into the
  //overarching algorithm. LoadMoreItems is an algorithm that existed between FolloweePresenter, FollowerPresenter, StoryPresenter
  // and PostStatusPresenter. We factored it out into PagedItemPresenter and then had them define the following functions
  protected abstract itemDescription(): string;

  protected abstract serviceFactory(): U;

  protected abstract getMoreItems(
    authToken: AuthToken,
    userAlias: string,
  ): Promise<[T[], boolean]>;
}
