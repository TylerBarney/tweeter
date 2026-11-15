// AI-assisted: see AI-ATTRIBUTION.md
import { RegisterRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { createAuthenticationHandler } from "./AuthenticationHandler";

export const handler = createAuthenticationHandler<RegisterRequest>(
  (request) =>
    new UserService().register(
      request.firstName,
      request.lastName,
      request.alias,
      request.password,
      request.userImageBytes,
      request.imageFileExtension,
    ),
);
