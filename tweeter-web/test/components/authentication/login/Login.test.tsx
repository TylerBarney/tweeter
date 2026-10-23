import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import { UserEvent, userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(fab);
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";
import { LoginPresenter } from "../../../../src/presenter/LoginPresenter";

describe("Login Component", () => {
  it("starts with the sign in button disabled", () => {
    const { signInButton } = renderLoginAndGetElement("/");
    expect(signInButton).toBeDisabled();
  });
  it("sign-in button is enabled when both the alias and password fields have text", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElement("/");

    await enableSignInButton(signInButton, aliasField, passwordField, user);
  });
  it("sign-in button is disabled if either the alias or password field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElement("/");

    await enableSignInButton(signInButton, aliasField, passwordField, user);
    await user.clear(aliasField);
    expect(signInButton).toBeDisabled();

    await enableSignInButton(signInButton, aliasField, passwordField, user);
    await user.clear(passwordField);
    expect(signInButton).toBeDisabled();
  });
  it("presenter's login method is called with correct parameters when the sign-in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const originalUrl = "http://somewhere.com";
    const alias = "@alias";
    const password = "myPassword";

    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElement(originalUrl, mockPresenterInstance);

    await enableSignInButton(
      signInButton,
      aliasField,
      passwordField,
      user,
      alias,
      password,
    );
    await user.click(signInButton);
    verify(mockPresenter.login(alias, password, false, originalUrl)).once();
  });
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <Login originalUrl={originalUrl} presenter={presenter} />
      ) : (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>,
  );
}

function renderLoginAndGetElement(
  originalUrl: string,
  presenter?: LoginPresenter,
) {
  const user = userEvent.setup();

  renderLogin(originalUrl, presenter);

  const signInButton = screen.getByRole("button", { name: /Sign in/i });
  const aliasField = screen.getByLabelText("alias");
  const passwordField = screen.getByLabelText("password");

  return { user, signInButton, aliasField, passwordField };
}

async function enableSignInButton(
  signInButton: HTMLElement,
  aliasField: HTMLElement,
  passwordField: HTMLElement,
  user: UserEvent,
  aliasText: string = "hi",
  passwordText: string = "what",
) {
  await user.type(aliasField, aliasText);
  await user.type(passwordField, passwordText);
  expect(signInButton).toBeEnabled();
}
