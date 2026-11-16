// AI-assisted: see AI-ATTRIBUTION.md
import { UserRequest } from "./UserRequest";

export interface PagedItemRequest<T> extends UserRequest {
  readonly pageSize: number;
  readonly lastItem: T | null;
}
