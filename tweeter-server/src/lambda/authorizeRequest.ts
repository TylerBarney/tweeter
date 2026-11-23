// AI-assisted: see AI-ATTRIBUTION.md
import { TokenRequest } from "tweeter-shared";
import { AuthSession } from "../model/dao/AuthTokenDao";
import { AuthorizationService } from "../model/service/AuthorizationService";

export function authorizeRequest(request: TokenRequest): Promise<AuthSession> {
  return new AuthorizationService().authorize(request.token);
}

export function authorizeAlias(
  request: TokenRequest,
  alias: string,
): Promise<AuthSession> {
  return new AuthorizationService().authorizeAlias(request.token, alias);
}
