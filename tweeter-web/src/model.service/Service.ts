// AI-assisted: see AI-ATTRIBUTION.md
import { ServerFacade } from "../network/ServerFacade";

export abstract class Service {
  private _serverFacade = new ServerFacade();

  public get serverFacade(): ServerFacade {
    return this._serverFacade;
  }
}
