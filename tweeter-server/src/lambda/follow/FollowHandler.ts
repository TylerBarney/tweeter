// AI-assisted: see AI-ATTRIBUTION.md
import { FollowRequest, FollowResponse, UserDto } from "tweeter-shared";
import { authorizeRequest } from "../authorizeRequest";
import { withApiErrors } from "../withApiErrors";

type RelationshipUpdater = (
  followerAlias: string,
  user: UserDto,
) => Promise<[followerCount: number, followeeCount: number]>;

export const createFollowHandler =
  (updateRelationship: RelationshipUpdater) =>
  withApiErrors(async (request: FollowRequest): Promise<FollowResponse> => {
    const session = await authorizeRequest(request);
    const [followerCount, followeeCount] = await updateRelationship(
      session.alias,
      request.user,
    );
    return {
      success: true,
      message: null,
      followerCount,
      followeeCount,
    };
  });
