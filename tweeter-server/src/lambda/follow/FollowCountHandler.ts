// AI-assisted: see AI-ATTRIBUTION.md
import {
  FollowRequest,
  FollowCountResponse,
  UserDto,
} from "tweeter-shared";
import { authorizeRequest } from "../authorizeRequest";
import { withApiErrors } from "../withApiErrors";

type CountLoader = (token: string, user: UserDto) => Promise<number>;

export const createFollowCountHandler =
  (loadCount: CountLoader) =>
  withApiErrors(
    async (request: FollowRequest): Promise<FollowCountResponse> => {
      await authorizeRequest(request);
      const count = await loadCount(request.token, request.user);
      return {
        success: true,
        message: null,
        count,
      };
    },
  );
