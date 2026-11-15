// AI-assisted: see AI-ATTRIBUTION.md
import { UserDto } from "../../dto/UserDto";
import { TokenRequest } from "./TokenRequest";

export interface FollowRequest extends TokenRequest {
  readonly user: UserDto;
}
