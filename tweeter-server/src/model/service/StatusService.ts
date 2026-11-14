// AI-assisted: see AI-ATTRIBUTION.md
import { FakeData, Status, StatusDto } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService implements Service {
  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return await this.getFakeData(lastItem, pageSize);
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null,
  ): Promise<[StatusDto[], boolean]> {
    // TODO: Replace with the result of calling server
    return await this.getFakeData(lastItem, pageSize);
  }

  private getFakeData(
    lastItem: StatusDto | null,
    pageSize: number,
  ): [StatusDto[], boolean] {
    const [items, hasMore] = FakeData.instance.getPageOfStatuses(
      Status.fromDto(lastItem),
      pageSize,
    );
    const dtos: StatusDto[] = items.map((status) => status.dto);
    return [dtos, hasMore];
  }

  public async postStatus(token: string, newStatus: Status): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
