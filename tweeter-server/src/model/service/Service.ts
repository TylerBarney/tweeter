// AI-assisted: see AI-ATTRIBUTION.md
import { DaoFactory } from "../dao/DaoFactory";
import { DataPage } from "../dao/DataPage";
import { defaultDaoFactory } from "../dao/defaultFactory";

export abstract class Service {
  constructor(protected readonly factory: DaoFactory = defaultDaoFactory) {}

  protected async loadPage<T, D>(
    load: () => Promise<DataPage<T>>,
    toDto: (item: T) => D,
  ): Promise<[D[], boolean]> {
    const page = await load();
    return [page.values.map(toDto), page.hasMorePages];
  }
}
