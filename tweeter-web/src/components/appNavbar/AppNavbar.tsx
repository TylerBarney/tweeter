import "./AppNavbar.css";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Image from "react-bootstrap/Image";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import {
  AppNavBarPresenter,
  AppNavBarView,
} from "../../presenter/AppNavBarPresenter";
import AppNavBarItem from "./AppNavBarItem";
import usePresenter from "../hooks/usePresenter";

const AppNavbar = () => {
  const location = useLocation();
  const { authToken, displayedUser } = useUserInfo();
  const { clearUserInfo } = useUserInfoActions();
  const navigate = useNavigate();
  const { displayInfoMessage, displayErrorMessage, deleteMessage } =
    useMessageActions();

  const view: AppNavBarView = {
    displayInfoMessage: displayInfoMessage,
    displayErrorMessage: displayErrorMessage,
    clearUserInfo: clearUserInfo,
    deleteMessage: deleteMessage,
    navigate: navigate,
  };

  const presenter = usePresenter(
    () => view,
    (view) => new AppNavBarPresenter(view),
  );

  const logOut = async () => {
    presenter.logOut(authToken!);
  };

  return (
    <Navbar
      collapseOnSelect
      className="mb-4"
      expand="md"
      bg="primary"
      variant="dark"
    >
      <Container>
        <Navbar.Brand>
          <div className="d-flex flex-row">
            <div className="p-2">
              <NavLink className="brand-link" to="/">
                <Image src={"/bird-white-32.png"} alt="" />
              </NavLink>
            </div>
            <div id="brand-title" className="p-3">
              <NavLink className="brand-link" to="/">
                <b>Tweeter</b>
              </NavLink>
            </div>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            <AppNavBarItem
              featureName="Feed"
              featurePath="/feed/"
              alias={displayedUser!.alias}
            />
            <AppNavBarItem
              featureName="Story"
              featurePath="/story/"
              alias={displayedUser!.alias}
            />
            <AppNavBarItem
              featureName="Followees"
              featurePath="/followees/"
              alias={displayedUser!.alias}
            />
            <AppNavBarItem
              featureName="Followers"
              featurePath="/followers/"
              alias={displayedUser!.alias}
            />
            <Nav.Item>
              <NavLink
                id="logout"
                onClick={logOut}
                to={location.pathname}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Logout
              </NavLink>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
