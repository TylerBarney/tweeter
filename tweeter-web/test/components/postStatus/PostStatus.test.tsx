import { instance, mock, verify } from "@typestrong/ts-mockito";
import { useUserInfo } from "../../../src/components/userInfo/UserInfoHooks";
import { AuthToken, User } from "tweeter-shared";
import { render, screen } from "@testing-library/react";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import userEvent, { UserEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";

jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

describe("PostStatus Component", () => {
  let mockUser: User;
  let mockAuthToken: AuthToken;
  let mockUserInstance: User;
  let mockAuthTokenInstance: AuthToken;
  beforeAll(() => {
    mockUser = mock<User>();
    mockAuthToken = mock<AuthToken>();
    mockUserInstance = instance(mockUser);
    mockAuthTokenInstance = instance(mockAuthToken);

    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  it("starts with the Post Status and Clear buttons both disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    checkButtonsDisabled(postStatusButton, clearButton);
  });

  it("Both buttons are enabled when the text field has text.", async () => {
    const { postStatusButton, clearButton, postField, user } =
      renderPostStatusAndGetElements();
    await user.type(postField, "Hello");
    checkButtonsEnabled(postStatusButton, clearButton);
  });

  it("Both buttons are disabled when the text field is cleared", async () => {
    const { postStatusButton, clearButton, postField, user } =
      renderPostStatusAndGetElements();
    await user.type(postField, "Hello");
    checkButtonsEnabled(postStatusButton, clearButton);

    await user.click(clearButton);
    expect(postField).toHaveValue("");
    checkButtonsDisabled(postStatusButton, clearButton);
  });

  it("presenter's postStatus method is called with correct parameters when the Post Status button is pressed", async () => {
    const mockPostStatusPresenter = mock<PostStatusPresenter>();
    const mockPostStatusPresenterInstance = instance(mockPostStatusPresenter);
    const { postStatusButton, postField, user } =
      renderPostStatusAndGetElements(mockPostStatusPresenterInstance);
    const postString = "hi";
    await user.type(postField, postString);
    expect(postStatusButton).toBeEnabled();
    await user.click(postStatusButton);
    verify(
      mockPostStatusPresenter.submitPost(
        postString,
        mockUserInstance,
        mockAuthTokenInstance,
      ),
    ).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <>{!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}</>,
  );
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();
  renderPostStatus(presenter);

  const postStatusButton = screen.getByLabelText("post status");
  const clearButton = screen.getByLabelText("clear");
  const postField = screen.getByLabelText("post field");

  return { postStatusButton, clearButton, postField, user };
}

function checkButtonsDisabled(
  postStatusButton: HTMLElement,
  clearButton: HTMLElement,
) {
  expect(clearButton).toBeDisabled();
  expect(postStatusButton).toBeDisabled();
}

function checkButtonsEnabled(
  postStatusButton: HTMLElement,
  clearButton: HTMLElement,
) {
  expect(clearButton).toBeEnabled();
  expect(postStatusButton).toBeEnabled();
}
