interface Props {
  isLoading: boolean;
  followOperationOnDisplayedUser: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
  buttonId: string;
  buttonText: string;
  bootstrapClass: string;
}
const UserInfoFollowButton = (props: Props) => {
  return (
    <button
      id={props.buttonId}
      className={`btn btn-md ${props.bootstrapClass} me-1`}
      type="submit"
      style={{ width: "6em" }}
      disabled={props.isLoading}
      onClick={props.followOperationOnDisplayedUser}
    >
      {props.isLoading ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
      ) : (
        <div>{props.buttonText}</div>
      )}
    </button>
  );
};

export default UserInfoFollowButton;
