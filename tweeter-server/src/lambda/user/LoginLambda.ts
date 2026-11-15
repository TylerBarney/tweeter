// AI-assisted: see AI-ATTRIBUTION.md
import { LoginRequest, LoginResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: LoginRequest,
): Promise<LoginResponse> => {
  const [user, authToken] = await new UserService().login(
    request.alias,
    request.password,
  );
  return {
    success: true,
    message: null,
    user,
    authToken,
  };
};
