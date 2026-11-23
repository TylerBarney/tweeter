// AI-assisted: see AI-ATTRIBUTION.md
export const SERVER_ERROR_MESSAGE =
  "[Server Error] The server could not complete the request";

const BAD_REQUEST_PREFIX = "[Bad Request]";

export function badRequest(message: string): never {
  throw new Error(`${BAD_REQUEST_PREFIX} ${message}`);
}

export function isBadRequest(error: unknown): boolean {
  return (
    error instanceof Error && error.message.startsWith(BAD_REQUEST_PREFIX)
  );
}
