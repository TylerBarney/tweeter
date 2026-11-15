// AI-assisted: see AI-ATTRIBUTION.md
import { FollowService } from "../../model/service/FollowService";
import { createFollowCountHandler } from "./FollowCountHandler";

export const handler = createFollowCountHandler((token, user) =>
  new FollowService().getFollowerCount(token, user),
);
