import {
  Channel,
  FarcasterCastV1,
  FarcasterFeedRequest,
  FarcasterUserV1,
  FetchCastsResponse,
  FetchChannelsResponse,
  FetchUsersResponse,
  GetFarcasterChannelsRequest,
  GetFarcasterUsersRequest,
  UserFilter,
} from "../../../types";
import { BaseAPIClient } from "../base";

export class FarcasterAPIV1Client extends BaseAPIClient {
  API_ENDPOINT = `${process.env.FARCASTER_API_ENDPOINT}/v1`;

  async getChannel(id: string, viewerFid?: string): Promise<Channel> {
    const response = await this.makeRequest(`/channels/${id}`, { viewerFid });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getChannelByUrl(url: string, viewerFid?: string): Promise<Channel> {
    const response = await this.makeRequest(
      `/channels/by-url/${encodeURIComponent(url)}`,
      {
        viewerFid,
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getChannels(
    req: GetFarcasterChannelsRequest,
    viewerFid?: string,
  ): Promise<FetchChannelsResponse> {
    const response = await this.makeRequest("/channels", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
      viewerFid,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUser(
    usernameOrFid: string,
    fid?: boolean,
    viewerFid?: string,
  ): Promise<FarcasterUserV1> {
    const response = await this.makeRequest(
      `/users/${usernameOrFid}${fid ? `?fid=${fid}` : ""}`,
      {
        viewerFid,
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserMutualsPreview(
    fid: string,
    viewerFid: string,
  ): Promise<FarcasterUserV1> {
    const response = await this.makeRequest(`/users/${fid}/mutuals-preview`, {
      viewerFid,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserMutuals(
    viewerFid: string,
    fid: string,
    cursor?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest(
      `/users/${fid}/mutuals${cursor ? `?cursor=${cursor}` : ""}`,
      {
        viewerFid,
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserFollowers(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest(
      `/users/${fid}/followers${cursor ? `?cursor=${cursor}` : ""}`,
      {
        viewerFid,
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserFollowing(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest(
      `/users/${fid}/following${cursor ? `?cursor=${cursor}` : ""}`,
      {
        viewerFid,
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserFollowingFids(fid: string): Promise<{ data: string[] }> {
    const response = await this.makeRequest(`/users/${fid}/following/fids`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUsers(
    req: GetFarcasterUsersRequest,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest("/users", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
      viewerFid,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserFids(
    req: GetFarcasterUsersRequest,
  ): Promise<{ data: string[] }> {
    const response = await this.makeRequest("/users/fids", {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getUserAddresses(
    req: UserFilter,
  ): Promise<{ data: { fid: string; address: string }[] }> {
    const response = await this.makeRequest("/users/addresses", {
      method: "POST",
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastV1 | undefined> {
    const response = await this.makeRequest(`/casts/${hash}`, { viewerFid });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCastsForHashes(
    hashes: string[],
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
    const response = await this.makeRequest("/casts/hashes", {
      method: "POST",
      body: JSON.stringify({ hashes }),
      viewerFid,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
    const response = await this.makeRequest(
      `/casts/${hash}/replies${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getNewCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
    const response = await this.makeRequest(
      `/casts/${hash}/replies/new${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getTopCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
    const response = await this.makeRequest(
      `/casts/${hash}/replies/top${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCastQuotes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchCastsResponse> {
    const response = await this.makeRequest(
      `/casts/${hash}/quotes${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCastLikes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest(
      `/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getCastRecasts(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest(
      `/casts/${hash}/recasts${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async searchUsers(
    query: string,
    limit?: number,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchUsersResponse> {
    const response = await this.makeRequest(
      `/users?query=${query}${limit ? `&limit=${limit}` : ""}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async searchChannels(
    query: string,
    limit?: number,
    cursor?: string,
    viewerFid?: string,
  ): Promise<FetchChannelsResponse> {
    const response = await this.makeRequest(
      `/channels?query=${query}${limit ? `&limit=${limit}` : ""}${
        cursor ? `&cursor=${cursor}` : ""
      }`,
      { viewerFid },
    );

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
}
