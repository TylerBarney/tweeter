import "./PostStatus.css";
import { useState } from "react";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo } from "../userInfo/UserInfoHooks";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../presenter/PostStatusPresenter";
import useAsyncHook from "../hooks/asyncHooks";
import usePresenter from "../hooks/usePresenter";

interface Props {
  presenter?: PostStatusPresenter;
}
const PostStatus = (props: Props) => {
  const { displayInfoMessage, displayErrorMessage, deleteMessage } =
    useMessageActions();

  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState("");
  const { isLoading, doAsync } = useAsyncHook();

  const view: PostStatusView = {
    displayInfoMessage: displayInfoMessage,
    displayErrorMessage: displayErrorMessage,
    deleteMessage: deleteMessage,
    setPost: setPost,
  };

  const presenter = usePresenter(
    () => view,
    (view) => props.presenter ?? new PostStatusPresenter(view),
  );

  const submitPost = async (event: React.MouseEvent) => {
    event.preventDefault();
    await doAsync(async () => {
      await presenter.submitPost(post, currentUser!, authToken!);
    });
  };

  const clearPost = (event: React.MouseEvent) => {
    event.preventDefault();
    presenter.clearPost();
  };

  const checkButtonStatus: () => boolean = () => {
    return !post.trim() || !authToken || !currentUser || isLoading;
  };

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          aria-label="post field"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          aria-label="post status"
          type="button"
          disabled={checkButtonStatus()}
          style={{ width: "8em" }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          aria-label="clear"
          disabled={checkButtonStatus()}
          onClick={clearPost}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
