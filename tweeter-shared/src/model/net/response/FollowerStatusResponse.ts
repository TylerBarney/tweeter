// AI-assisted: see AI-ATTRIBUTION.md
import { TweeterResponse } from "./TweeterResponse";

export interface FollowerStatusResponse extends TweeterResponse {
  readonly isFollower: boolean;
}
