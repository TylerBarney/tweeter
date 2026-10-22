import Post from "./Post";
import { Status } from "tweeter-shared";
import UserItem from "../userItem/UserItem";

interface Props {
  status: Status;
  featurePath: string;
}
const StatusItem = (props: Props) => {
  return (
    <UserItem user={props.status.user} featurePath={props.featurePath}>
      {props.status.formattedDate}
      <br />
      <Post status={props.status} featurePath={props.featurePath} />
    </UserItem>
  );
};

export default StatusItem;
