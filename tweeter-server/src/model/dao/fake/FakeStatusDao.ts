// AI-assisted: see AI-ATTRIBUTION.md
import { Status } from "tweeter-shared";
import { DataPage } from "../DataPage";
import { StatusDao } from "../StatusDao";
import { FakeDao } from "./FakeDao";

export class FakeStatusDao extends FakeDao implements StatusDao {
  public async getPage(
    _alias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<DataPage<Status>> {
    return this.page(this.data.getPageOfStatuses(lastItem, pageSize));
  }

  public async put(_status: Status): Promise<void> {}
}
