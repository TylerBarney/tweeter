// AI-assisted: see AI-ATTRIBUTION.md
import { FollowRequest, FollowResponse, UserDto } from "tweeter-shared";
import { authorizeRequest } from "../authorizeRequest";

type RelationshipUpdater = (
  token: string,
  user: UserDto,
) => Promise<[followerCount: number, followeeCount: number]>;

export const createFollowHandler =
  (updateRelationship: RelationshipUpdater) =>
  async (request: FollowRequest): Promise<FollowResponse> => {
    await authorizeRequest(request);
    const [followerCount, followeeCount] = await updateRelationship(
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
