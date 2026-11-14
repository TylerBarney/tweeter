// AI-assisted: see AI-ATTRIBUTION.md
import { PostStatusRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const handler = async (
  request: PostStatusRequest,
): Promise<TweeterResponse> => {
  await new StatusService().postStatus(request.token, request.newStatus);
  return {
    success: true,
    message: null,
  };
};
