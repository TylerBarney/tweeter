// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken, PagedUserStatusItemRequest, Status } from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";
import { Service } from "./Service";

export class StatusService implements Service {
  private readonly serverFacade = new ServerFacade();

  public loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    return this.loadMoreStatuses(
      authToken,
      userAlias,
      pageSize,
      lastItem,
      (request) => this.serverFacade.getMoreStoryItems(request),
    );
  }

  public loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    return this.loadMoreStatuses(
      authToken,
      userAlias,
      pageSize,
      lastItem,
      (request) => this.serverFacade.getMoreFeedItems(request),
    );
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status,
  ): Promise<void> {
    await this.serverFacade.postStatus({
      token: authToken.token,
      newStatus: newStatus.dto,
    });
  }

  private loadMoreStatuses(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
    loadPage: (
      request: PagedUserStatusItemRequest,
    ) => Promise<[Status[], boolean]>,
  ): Promise<[Status[], boolean]> {
    return loadPage({
      token: authToken.token,
      userAlias,
      pageSize,
      lastItem: lastItem === null ? null : lastItem.dto,
    });
  }
}
