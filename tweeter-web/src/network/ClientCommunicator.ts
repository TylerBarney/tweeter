// AI-assisted: see AI-ATTRIBUTION.md
import { TweeterRequest, TweeterResponse } from "tweeter-shared";

export class ClientCommunicator {
  private SERVER_URL: string;

  public constructor(SERVER_URL: string) {
    this.SERVER_URL = SERVER_URL;
  }

  public async doPost<REQ extends TweeterRequest, RES extends TweeterResponse>(
    req: REQ | undefined,
    endpoint: string,
    headers?: Headers,
  ): Promise<RES> {
    if (headers && req) {
      headers.append("Content-type", "application/json");
    } else if (req) {
      headers = new Headers({
        "Content-type": "application/json",
      });
    }

    console.log(`The request body is '${JSON.stringify(req)}'`);

    const url = this.getUrl(endpoint);
    const params = this.getParams(
      "POST",
      headers,
      req ? JSON.stringify(req) : req,
    );

    console.log(`Fetching '${url}' with params '${JSON.stringify(params)}'`);

    const resp = await fetch(url, params);

    if (resp.ok) {
      const response: RES = await resp.json();
      return response;
    }

    const error = await resp.json();
    const message =
      typeof error.errorMessage === "string" ? error.errorMessage : "";
    throw new Error(message);
  }

  private getUrl(endpoint: string): string {
    return this.SERVER_URL + endpoint;
  }

  private getParams(
    method: string,
    headers?: Headers,
    body?: BodyInit,
  ): RequestInit {
    const params: RequestInit = { method: method };

    if (headers) {
      params.headers = headers;
    }

    if (body) {
      params.body = body;
    }

    return params;
  }
}
