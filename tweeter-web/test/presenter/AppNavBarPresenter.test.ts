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
  AppNavBarPresenter,
  AppNavBarView,
} from "../../src/presenter/AppNavBarPresenter";
import { AuthToken } from "tweeter-shared";
import { UserService } from "../../src/model.service/UserService";

describe("AppNavBarPresenter", () => {
  let mockAppNavBarPresenterView: AppNavBarView;
  let appNavBarPresenter: AppNavBarPresenter;
  let mockService: UserService;
  const authToken = new AuthToken("SomeToken", Date.now());

  beforeEach(() => {
    mockAppNavBarPresenterView = mock<AppNavBarView>();
    const mockAppNavBarPresenterViewInstance = instance(
      mockAppNavBarPresenterView,
    );

    const appNavBarPresenterSpy = spy(
      new AppNavBarPresenter(mockAppNavBarPresenterViewInstance),
    );

    appNavBarPresenter = instance(appNavBarPresenterSpy);

    mockService = mock<UserService>();

    when(appNavBarPresenterSpy.service).thenReturn(instance(mockService));
    when(
      mockAppNavBarPresenterView.displayInfoMessage(anyString(), 0),
    ).thenReturn("toastId");
  });
  it("tells the view to display a logging out message", async () => {
    await appNavBarPresenter.logOut(authToken);
    verify(
      mockAppNavBarPresenterView.displayInfoMessage("Logging Out...", 0),
    ).once();
  });
  it("calls logout on the user service with the correct auth token", async () => {
    await appNavBarPresenter.logOut(authToken);
    //verify(mockService.logout(authToken)).once();

    let [capturedAuthToken] = capture(mockService.logout).last();
    expect(capturedAuthToken).toEqual(authToken);
  });
  it("tells view to clear the info message that was displayed previously, clears the user info, and navigates to the login page when successful", async () => {
    await appNavBarPresenter.logOut(authToken);
    verify(mockAppNavBarPresenterView.deleteMessage("toastId")).once();
    verify(mockAppNavBarPresenterView.clearUserInfo()).once();
    verify(mockAppNavBarPresenterView.navigate("/login")).once();
    verify(mockAppNavBarPresenterView.displayErrorMessage(anything())).never();
  });
  it("tells view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page when unsuccessful", async () => {
    let error = new Error("An error occured");
    when(mockService.logout(anything())).thenThrow(error);
    await appNavBarPresenter.logOut(authToken);
    verify(
      mockAppNavBarPresenterView.displayErrorMessage(
        `Failed to log user out because of exception: An error occured`,
      ),
    ).once();
    verify(mockAppNavBarPresenterView.deleteMessage(anyString())).never();
    verify(mockAppNavBarPresenterView.clearUserInfo()).never();
    verify(mockAppNavBarPresenterView.navigate("/login")).never();
  });
});
