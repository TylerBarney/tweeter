// AI-assisted: see AI-ATTRIBUTION.md
import {
  FollowerStatusRequest,
  FollowerStatusResponse,
} from "tweeter-shared";
import { authorizeRequest } from "../authorizeRequest";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (
  request: FollowerStatusRequest,
): Promise<FollowerStatusResponse> => {
  await authorizeRequest(request);
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
