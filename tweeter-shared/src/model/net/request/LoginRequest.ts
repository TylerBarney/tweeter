// AI-assisted: see AI-ATTRIBUTION.md
import { TweeterRequest } from "./TweeterRequest";

export interface LoginRequest extends TweeterRequest {
  readonly alias: string;
  readonly password: string;
}
