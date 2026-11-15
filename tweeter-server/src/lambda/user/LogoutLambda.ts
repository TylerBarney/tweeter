// AI-assisted: see AI-ATTRIBUTION.md
import { TokenRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (
  request: TokenRequest,
): Promise<TweeterResponse> => {
  await new UserService().logout(request.token);
  return {
    success: true,
    message: null,
  };
};
