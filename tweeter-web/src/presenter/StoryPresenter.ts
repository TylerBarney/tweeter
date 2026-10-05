import { AuthToken } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import {
  PAGE_SIZE,
  StatusItemPresenter,
  StatusItemView,
} from "./StatusItemPresenter";

export class StoryPresenter extends StatusItemPresenter {
  private service: StatusService;

  public constructor(view: StatusItemView) {
    super(view);
    this.service = new StatusService();
  }

  public async loadMoreItems(authToken: AuthToken, alias: string) {
    try {
      const [newItems, hasMore] = await this.service.loadMoreStoryItems(
        authToken,
        alias,
        PAGE_SIZE,
        this.lastItem,
      );

      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to load feed items because of exception: ${error}`,
      );
    }
  }
}
