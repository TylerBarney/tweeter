import "./UserInfoComponent.css";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "./UserInfoHooks";
import {
  UserInfoPresenter,
  UserInfoView,
} from "../../presenter/UserInfoPresenter";
import UserInfoFollowButton from "./UserInfoFollowButton";
import useAsyncHook from "../hooks/asyncHooks";
import usePresenter from "../hooks/usePresenter";

const UserInfo = () => {
  const [isFollower, setIsFollower] = useState(false);
  const [followeeCount, setFolloweeCount] = useState(-1);
  const [followerCount, setFollowerCount] = useState(-1);
  const { isLoading, doAsync } = useAsyncHook();

  const { displayInfoMessage, displayErrorMessage, deleteMessage } =
    useMessageActions();

  const { currentUser, authToken, displayedUser } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();
  const location = useLocation();

  const view: UserInfoView = {
    displayInfoMessage: displayInfoMessage,
    displayErrorMessage: displayErrorMessage,
    deleteMessage: deleteMessage,
    navigate: navigate,
    setFolloweeCount: setFolloweeCount,
    setIsFollower: setIsFollower,
    setFollowerCount: setFollowerCount,
    setDisplayedUser: setDisplayedUser,
  };

  const presenter = usePresenter(
    () => view,
    (view) => new UserInfoPresenter(view),
  );

  if (!displayedUser) {
    setDisplayedUser(currentUser!);
  }

  useEffect(() => {
    presenter.setIsFollowerStatus(authToken!, currentUser!, displayedUser!);
    presenter.getFollowerCount(authToken!, displayedUser!);
    presenter.getFolloweeCount(authToken!, displayedUser!);
  }, [displayedUser]);

  const switchToLoggedInUser = (event: React.MouseEvent): void => {
    event.preventDefault();
    presenter.switchToLoggedInUser(currentUser!, location.pathname);
  };

  const followDisplayedUser = async (
    event: React.MouseEvent,
  ): Promise<void> => {
    event.preventDefault();
    await doAsync(async () => {
      await presenter.followUser(authToken!, displayedUser!);
    });
  };

  const unfollowDisplayedUser = async (
    event: React.MouseEvent,
  ): Promise<void> => {
    event.preventDefault();
    await doAsync(async () => {
      await presenter.unfollowUser(authToken!, displayedUser!);
    });
  };

  return (
    <>
      {currentUser === null || displayedUser === null || authToken === null ? (
        <></>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-auto p-3">
              <img
                src={displayedUser.imageUrl}
                className="img-fluid"
                width="100"
                alt="Posting user"
              />
            </div>
            <div className="col p-3">
              {!displayedUser.equals(currentUser) && (
                <p id="returnToLoggedInUser">
                  Return to{" "}
                  <Link
                    to={`./${currentUser.alias}`}
                    onClick={switchToLoggedInUser}
                  >
                    logged in user
                  </Link>
                </p>
              )}
              <h2>
                <b>{displayedUser.name}</b>
              </h2>
              <h3>{displayedUser.alias}</h3>
              <br />
              {followeeCount > -1 && followerCount > -1 && (
                <div>
                  Followees: {followeeCount} Followers: {followerCount}
                </div>
              )}
            </div>
            <form>
              {!displayedUser.equals(currentUser) && (
                <div className="form-group">
                  {isFollower ? (
                    <UserInfoFollowButton
                      isLoading={isLoading}
                      buttonId="unFollowButton"
                      buttonText="Unfollow"
                      followOperationOnDisplayedUser={unfollowDisplayedUser}
                      bootstrapClass="btn-secondary"
                    />
                  ) : (
                    <UserInfoFollowButton
                      isLoading={isLoading}
                      buttonId="followButton"
                      bootstrapClass="btn-primary"
                      followOperationOnDisplayedUser={followDisplayedUser}
                      buttonText="Follow"
                    />
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
