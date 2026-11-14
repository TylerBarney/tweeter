// AI-assisted: see AI-ATTRIBUTION.md
import { FollowCountRequest, FollowCountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowCountRequest,
): Promise<FollowCountResponse> => {
  const count = await new FollowService().getFolloweeCount(
    request.token,
    request.user,
  );
  return {
    success: true,
    message: null,
    count,
  };
};
