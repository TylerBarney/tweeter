// AI-assisted: see AI-ATTRIBUTION.md
import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { authorizeAlias } from "../authorizeRequest";
import { withApiErrors } from "../withApiErrors";
import { StatusService } from "../../model/service/StatusService";

export const handler = withApiErrors(
  async (request: PostStatusRequest): Promise<TweeterResponse> => {
    await authorizeAlias(request, request.newStatus.user.alias);
    await new StatusService().postStatus(request.token, request.newStatus);
    return {
      success: true,
      message: null,
    };
  },
);
