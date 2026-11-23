// AI-assisted: see AI-ATTRIBUTION.md
import { AuthorizationService } from "../../model/service/AuthorizationService";
import { createAuthenticationHandler } from "./AuthenticationHandler";

export const handler = createAuthenticationHandler((request) =>
  new AuthorizationService().login(request.alias, request.password),
);
