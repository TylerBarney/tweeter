// AI-assisted: see AI-ATTRIBUTION.md
import { UserRequest, UserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (request: UserRequest): Promise<UserResponse> => {
  const user = await new UserService().getUser(request.token, request.alias);
  return {
    success: true,
    message: null,
    user,
  };
};
