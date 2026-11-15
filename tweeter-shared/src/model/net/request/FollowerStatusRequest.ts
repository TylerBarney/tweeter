// AI-assisted: see AI-ATTRIBUTION.md
import { UserDto } from "../../dto/UserDto";
import { FollowRequest } from "./FollowRequest";

export interface FollowerStatusRequest extends FollowRequest {
  readonly selectedUser: UserDto;
}
