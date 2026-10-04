import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useMessageActions } from "../../toaster/MessageHooks";
import { IconName } from "@fortawesome/fontawesome-svg-core";

interface Props {
  oauthName: string;
  buttonName: string;
  iconName: IconName;
}

const OAuth = (props: Props) => {
  const { displayInfoMessage } = useMessageActions();
  const displayInfoMessageWithDarkBackground = (message: string): void => {
    displayInfoMessage(message, 3000, "text-white bg-primary");
  };

  return (
    <button
      type="button"
      className="btn btn-link btn-floating mx-1"
      onClick={() =>
        displayInfoMessageWithDarkBackground(
          `${props.buttonName} registration is not implemented.`,
        )
      }
    >
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`${props.oauthName}Tooltip`}>{props.buttonName}</Tooltip>
        }
      >
        <FontAwesomeIcon icon={["fab", props.iconName]} />
      </OverlayTrigger>
    </button>
  );
};

export default OAuth;
