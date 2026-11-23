// AI-assisted: see AI-ATTRIBUTION.md
import { PagedItemRequest, PagedItemResponse } from "tweeter-shared";
import { authorizeRequest } from "./authorizeRequest";

type PageLoader<T> = (
  token: string,
  userAlias: string,
  pageSize: number,
  lastItem: T | null,
) => Promise<[T[], boolean]>;

export const createPagedItemHandler =
  <T>(loadPage: PageLoader<T>) =>
  async (request: PagedItemRequest<T>): Promise<PagedItemResponse<T>> => {
    await authorizeRequest(request);
    const [items, hasMore] = await loadPage(
      request.token,
      request.alias,
      request.pageSize,
      request.lastItem,
    );

    return {
      items,
      hasMore,
      success: true,
      message: null,
    };
  };
