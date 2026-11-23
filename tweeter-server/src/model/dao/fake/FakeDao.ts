// AI-assisted: see AI-ATTRIBUTION.md
import { FakeData } from "tweeter-shared";
import { DataPage } from "../DataPage";

export abstract class FakeDao {
  protected get data(): FakeData {
    return FakeData.instance;
  }

  protected page<T>([values, hasMorePages]: [T[], boolean]): DataPage<T> {
    return new DataPage(values, hasMorePages);
  }
}
