import {
  FarcasterCastV1,
  FarcasterFeedRequest,
  FarcasterUserV1,
  FetchCastsResponse,
} from "../../../types";
import { BaseAPIClient } from "../base";

export class FarcasterAPIV1Client extends BaseAPIClient {
  API_ENDPOINT = process.env.FARCASTER_API_ENDPOINT;

  async getCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastV1 | undefined> {
    const response = await this.makeRequest(`/v1/casts/${hash}`, {
      viewerFid,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCasts(
    req: FarcasterFeedRequest,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
    const response = await this.makeRequest("/v1/casts", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUser(
    username: string,
    fid?: boolean,
    viewerFid?: string,
  ): Promise<FarcasterUserV1 | undefined> {
    const response = await this.makeRequest(
      `/v1/users/${username}${fid ? `?fid=${fid}` : ""}`,
      {
        viewerFid,
      },
    );

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}
