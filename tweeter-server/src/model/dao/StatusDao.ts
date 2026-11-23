// AI-assisted: see AI-ATTRIBUTION.md
import { Status } from "tweeter-shared";
import { DataPage } from "./DataPage";

export interface StatusDao {
  getPage(
    alias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<DataPage<Status>>;

  put(status: Status): Promise<void>;
}
