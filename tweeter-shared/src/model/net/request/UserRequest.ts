// AI-assisted: see AI-ATTRIBUTION.md
import { TokenRequest } from "./TokenRequest";

export interface UserRequest extends TokenRequest {
  readonly alias: string;
}
