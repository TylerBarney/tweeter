// AI-assisted: see AI-ATTRIBUTION.md
import { TokenRequest, TweeterResponse } from "tweeter-shared";
import { authorizeRequest } from "../authorizeRequest";
import { withApiErrors } from "../withApiErrors";
import { UserService } from "../../model/service/UserService";

export const handler = withApiErrors(
  async (request: TokenRequest): Promise<TweeterResponse> => {
    await authorizeRequest(request);
    await new UserService().logout(request.token);
    return {
      success: true,
      message: null,
    };
  },
);
