// AI-assisted: see AI-ATTRIBUTION.md
import {
  FollowerStatusRequest,
  FollowerStatusResponse,
} from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowerStatusRequest,
): Promise<FollowerStatusResponse> => {
  const isFollower = await new FollowService().getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser,
  );
  return {
    success: true,
    message: null,
    isFollower,
  };
};
