import { StatusDto } from "../../dto/StatusDto";
import { PagedItemRequest } from "./PagedItemRequest";

export interface PagedUserStatusItemRequest extends PagedItemRequest<StatusDto> {}
