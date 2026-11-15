// AI-assisted: see AI-ATTRIBUTION.md
import { FollowService } from "../../model/service/FollowService";
import { createFollowHandler } from "./FollowHandler";

export const handler = createFollowHandler((token, user) =>
  new FollowService().follow(token, user),
);
