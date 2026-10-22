import { useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import {
  UserNavigationHooksPresenter,
  UserNavigationHooksView,
} from "../../presenter/UserNavigationHooksPresenter";
import usePresenter from "../hooks/usePresenter";

export const useUserNavigation = (featurePath: string) => {
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();

  const view: UserNavigationHooksView = {
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser,
    navigate: navigate,
  };

  const presenter = usePresenter(
    () => view,
    (view) => new UserNavigationHooksPresenter(view),
  );

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();
    presenter.navigateToUser(
      event.target.toString(),
      authToken!,
      displayedUser!,
      featurePath,
    );
  };

  return navigateToUser;
};
