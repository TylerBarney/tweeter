// AI-assisted: see AI-ATTRIBUTION.md
import { isBadRequest, SERVER_ERROR_MESSAGE } from "../model/apiError";

export function withApiErrors<TRequest, TResponse>(
  handle: (request: TRequest) => Promise<TResponse>,
): (request: TRequest) => Promise<TResponse> {
  return async (request) => {
    try {
      return await handle(request);
    } catch (error) {
      if (isBadRequest(error)) {
        throw error;
      }

      console.error(error);
      throw new Error(SERVER_ERROR_MESSAGE);
    }
  };
}
