// AI-assisted: see AI-ATTRIBUTION.md
import { DaoFactory } from "./DaoFactory";
import { DynamoDaoFactory } from "./dynamo/DynamoDaoFactory";

export const defaultDaoFactory: DaoFactory = new DynamoDaoFactory();
