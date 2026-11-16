// AI-assisted: see AI-ATTRIBUTION.md
import { AuthToken } from "tweeter-shared";
import { ServerFacade } from "../network/ServerFacade";

export abstract class Service {
  private _serverFacade = new ServerFacade();

  public get serverFacade(): ServerFacade {
    return this._serverFacade;
  }

  protected pagedRequest<T>(
    authToken: AuthToken,
    alias: string,
    pageSize: number,
    lastItem: { readonly dto: T } | null,
  ) {
    return {
      token: authToken.token,
      alias,
      pageSize,
      lastItem: lastItem === null ? null : lastItem.dto,
    };
  }
}
