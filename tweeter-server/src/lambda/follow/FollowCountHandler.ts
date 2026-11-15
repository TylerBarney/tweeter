// AI-assisted: see AI-ATTRIBUTION.md
import {
  FollowRequest,
  FollowCountResponse,
  UserDto,
} from "tweeter-shared";

type CountLoader = (token: string, user: UserDto) => Promise<number>;

export const createFollowCountHandler =
  (loadCount: CountLoader) =>
  async (request: FollowRequest): Promise<FollowCountResponse> => {
    const count = await loadCount(request.token, request.user);
    return {
      success: true,
      message: null,
      count,
    };
  };
