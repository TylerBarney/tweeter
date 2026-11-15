// AI-assisted: see AI-ATTRIBUTION.md
import { FollowRequest, FollowResponse, UserDto } from "tweeter-shared";

type RelationshipUpdater = (
  token: string,
  user: UserDto,
) => Promise<[followerCount: number, followeeCount: number]>;

export const createFollowHandler =
  (updateRelationship: RelationshipUpdater) =>
  async (request: FollowRequest): Promise<FollowResponse> => {
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
