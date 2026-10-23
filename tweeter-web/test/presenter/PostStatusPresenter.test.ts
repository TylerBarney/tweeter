import {
  anyString,
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenter/PostStatusPresenter";
import { AuthToken, User } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";

describe("PostStatusPresenter", () => {
  let postStatusPresenter: PostStatusPresenter;
  let mockPostStatusView: PostStatusView;
  let mockStatusService: StatusService;
  const user = new User("first", "last", "alias", "image");
  const authToken = new AuthToken("auth", Date.now());

  beforeEach(() => {
    mockPostStatusView = mock<PostStatusView>();
    const spyPostStatusPresenter = spy(
      new PostStatusPresenter(instance(mockPostStatusView)),
    );
    postStatusPresenter = instance(spyPostStatusPresenter);
    mockStatusService = mock<StatusService>();
    when(spyPostStatusPresenter.service).thenReturn(
      instance(mockStatusService),
    );
    when(mockPostStatusView.displayInfoMessage(anyString(), 0)).thenReturn(
      "toastId",
    );
  });

  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost("hello", user, authToken);
    verify(
      mockPostStatusView.displayInfoMessage("Posting status...", 0),
    ).once();
  });

  it("calls postStatus on the post status service with the correct status string and auth token", async () => {
    await postStatusPresenter.submitPost("hello", user, authToken);
    const [capturedAuthToken, capturedStatus] = capture(
      mockStatusService.postStatus,
    ).last();
    expect(capturedStatus.post).toEqual("hello");
    expect(capturedAuthToken).toEqual(authToken);
  });

  it("tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message, when posting of the status is successful", async () => {
    await postStatusPresenter.submitPost("hello", user, authToken);
    verify(mockPostStatusView.deleteMessage("toastId")).once();
    verify(mockPostStatusView.setPost("")).once();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000),
    ).once();
    verify(mockPostStatusView.displayErrorMessage(anyString())).never();
  });

  it("tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message, when posting of the status is not successful", async () => {
    const error = new Error("an error");
    when(mockStatusService.postStatus(anything(), anything())).thenThrow(error);
    await postStatusPresenter.submitPost("hello", user, authToken);

    verify(mockPostStatusView.deleteMessage("toastId")).once();
    verify(
      mockPostStatusView.displayErrorMessage(
        `Failed to post the status because of exception: an error`,
      ),
    ).once();
    verify(mockPostStatusView.setPost("")).never();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000),
    ).never();
  });
});
