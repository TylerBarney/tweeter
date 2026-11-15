// AI-assisted: see AI-ATTRIBUTION.md
import { FollowRequest, FollowResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowRequest,
): Promise<FollowResponse> => {
  const [followerCount, followeeCount] = await new FollowService().follow(
    request.token,
    request.user,
  );
  return {
    success: true,
    message: null,
    followerCount,
    followeeCount,
  };
};
