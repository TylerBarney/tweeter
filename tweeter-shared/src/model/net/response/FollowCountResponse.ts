// AI-assisted: see AI-ATTRIBUTION.md
import { TweeterResponse } from "./TweeterResponse";

export interface FollowCountResponse extends TweeterResponse {
  readonly count: number;
}
