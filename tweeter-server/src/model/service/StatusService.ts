// AI-assisted: see AI-ATTRIBUTION.md
import { Status, StatusDto } from "tweeter-shared";
import { StatusDao } from "../dao/StatusDao";
import { Service } from "./Service";
import { FollowDao } from "../dao/FollowDao";

export class StatusService extends Service {
  private feedDao: StatusDao;
  private storyDao: StatusDao;
  private followDao: FollowDao;
  public constructor() {
    super();
    this.feedDao = this.factory.feedDao;
    this.storyDao = this.factory.storyDao;
    this.followDao = this.factory.followDao;
  }
  public loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    return this.loadStatuses(this.storyDao, userAlias, pageSize, lastItem);
  }

  public loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    return this.loadStatuses(this.feedDao, userAlias, pageSize, lastItem);
  }

  public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
    await this.pause(2000);
    const status = Status.fromDto(newStatus);
    if (status === null) {
      return;
    }

    await this.storyDao.put(status);
    const followers = await this.followDao.getFollowerAliases(
      status.user.alias,
    );
    await this.feedDao.put(status, followers);
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
