import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import { LoginPresenter } from "../../../presenter/LoginPresenter";
import { AuthenticationView } from "../../../presenter/AuthenticationPresenter";
import useAsyncHook from "../../hooks/asyncHooks";
import usePresenter from "../../hooks/usePresenter";

interface Props {
  originalUrl?: string;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();
  const { isLoading, doAsync } = useAsyncHook();

  const view: AuthenticationView = {
    navigate: navigate,
    displayErrorMessage: displayErrorMessage,
    authenticated: (user, authToken, rememberMe) =>
      updateUserInfo(user, user, authToken, rememberMe),
  };

  const presenter = usePresenter(
    () => view,
    (view) => new LoginPresenter(view),
  );

  const checkSubmitButtonStatus = (): boolean => {
    return !alias || !password;
  };

  const doLogin = async () => {
    await doAsync(async () => {
      await presenter.login(alias, password, rememberMe, props.originalUrl);
    });
  };

  const inputFieldFactory = () => {
    return (
      <AuthenticationFields
        onEnter={doLogin}
        alias={alias}
        password={password}
        setAlias={setAlias}
        setPassword={setPassword}
        checkSubmitButtonStatus={checkSubmitButtonStatus}
      />
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
