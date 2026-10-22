import { Nav } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";

interface Props {
  featurePath: string;
  alias: string;
  featureName: string;
}
const AppNavBarItem = (props: Props) => {
  const location = useLocation();
  return (
    <Nav.Item>
      <NavLink
        to={`${props.featurePath}${props.alias}`}
        className={() =>
          location.pathname.startsWith(props.featurePath)
            ? "nav-link active"
            : "nav-link"
        }
      >
        {props.featureName}
      </NavLink>
    </Nav.Item>
  );
};

export default AppNavBarItem;
