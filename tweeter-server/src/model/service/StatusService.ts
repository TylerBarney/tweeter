// AI-assisted: see AI-ATTRIBUTION.md
import { Status, StatusDto } from "tweeter-shared";
import { DataPage } from "../dao/DataPage";
import { StatusDao } from "../dao/StatusDao";
import { Service } from "./Service";

export class StatusService extends Service {
  public loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    return this.loadStatuses(this.factory.storyDao, userAlias, pageSize, lastItem);
  }

  public loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    return this.loadStatuses(this.factory.feedDao, userAlias, pageSize, lastItem);
  }

  public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
    await this.pause(2000);
    const status = Status.fromDto(newStatus);
    if (status === null) {
      return;
    }

    await this.factory.storyDao.put(status);
    await this.factory.feedDao.put(status);
  }

  private loadStatuses(
    dao: StatusDao,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    return this.loadPage(
      () => dao.getPage(userAlias, pageSize, Status.fromDto(lastItem)),
      (status) => status.dto,
    );
  }
}
