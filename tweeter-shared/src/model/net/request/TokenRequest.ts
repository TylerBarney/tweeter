// AI-assisted: see AI-ATTRIBUTION.md
import { TweeterRequest } from "./TweeterRequest";

export interface TokenRequest extends TweeterRequest {
  readonly token: string;
}
