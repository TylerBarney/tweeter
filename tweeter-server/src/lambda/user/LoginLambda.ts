// AI-assisted: see AI-ATTRIBUTION.md
import { UserService } from "../../model/service/UserService";
import { createAuthenticationHandler } from "./AuthenticationHandler";

export const handler = createAuthenticationHandler((request) =>
  new UserService().login(request.alias, request.password),
);
