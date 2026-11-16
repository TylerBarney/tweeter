// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken, Status } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService extends Service {
  public loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    return this.serverFacade.getMoreStoryItems(
      this.pagedRequest(authToken, userAlias, pageSize, lastItem),
    );
  }

  public loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    return this.serverFacade.getMoreFeedItems(
      this.pagedRequest(authToken, userAlias, pageSize, lastItem),
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
}
