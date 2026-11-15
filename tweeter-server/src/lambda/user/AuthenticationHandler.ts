// AI-assisted: see AI-ATTRIBUTION.md
import {
  AuthenticationResponse,
  AuthTokenDto,
  LoginRequest,
  UserDto,
} from "tweeter-shared";

type Authenticator<T extends LoginRequest> = (
  request: T,
) => Promise<[UserDto, AuthTokenDto]>;

export const createAuthenticationHandler =
  <T extends LoginRequest>(authenticate: Authenticator<T>) =>
  async (request: T): Promise<AuthenticationResponse> => {
    const [user, authToken] = await authenticate(request);
    return {
      success: true,
      message: null,
      user,
      authToken,
    };
  };
