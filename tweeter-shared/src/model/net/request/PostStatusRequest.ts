// AI-assisted: see AI-ATTRIBUTION.md
import { StatusDto } from "../../dto/StatusDto";
import { TokenRequest } from "./TokenRequest";

export interface PostStatusRequest extends TokenRequest {
  readonly newStatus: StatusDto;
}
