// AI-assisted: see AI-ATTRIBUTION.md
import { DaoFactory } from "./DaoFactory";
import { FakeDaoFactory } from "./fake/FakeDaoFactory";

export const defaultDaoFactory: DaoFactory = new FakeDaoFactory();
