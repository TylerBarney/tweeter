// AI-assisted: see AI-ATTRIBUTION.md
import { PagedItemRequest, PagedItemResponse } from "tweeter-shared";

type PageLoader<T> = (
  token: string,
  userAlias: string,
  pageSize: number,
  lastItem: T | null,
) => Promise<[T[], boolean]>;

export const createPagedItemHandler =
  <T>(loadPage: PageLoader<T>) =>
  async (request: PagedItemRequest<T>): Promise<PagedItemResponse<T>> => {
    const [items, hasMore] = await loadPage(
      request.token,
      request.userAlias,
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
