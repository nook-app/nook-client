import {
  FarcasterUserV1,
  GetFarcasterUsersResponse,
  FarcasterCastV1,
  GetFarcasterCastsResponse,
  Channel,
  GetFarcasterUsersRequest,
  GetFarcasterChannelsRequest,
  GetFarcasterChannelsResponse,
  UserFilter,
  FetchCastsResponse,
} from "../../types";
import { FarcasterFeedRequest } from "../../types/feed";
import { BaseAPIClient } from "./base";

export class FarcasterAPIClient extends BaseAPIClient {
  API_ENDPOINT = process.env.FARCASTER_API_ENDPOINT;

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
  ): Promise<GetFarcasterChannelsResponse> {
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

  async getUser(fid: string, viewerFid?: string): Promise<FarcasterUserV1> {
    const response = await this.makeRequest(`/users/${fid}`, { viewerFid });

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
  ): Promise<GetFarcasterUsersResponse> {
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
  ): Promise<GetFarcasterUsersResponse> {
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
  ): Promise<GetFarcasterUsersResponse> {
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
  ): Promise<GetFarcasterUsersResponse> {
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

  async getCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await this.makeRequest("/casts", {
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
  ): Promise<GetFarcasterCastsResponse> {
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
  ): Promise<GetFarcasterCastsResponse> {
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
  ): Promise<GetFarcasterCastsResponse> {
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
  ): Promise<GetFarcasterCastsResponse> {
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
  ): Promise<GetFarcasterUsersResponse> {
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
  ): Promise<GetFarcasterUsersResponse> {
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
  ): Promise<GetFarcasterUsersResponse> {
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
  ): Promise<GetFarcasterChannelsResponse> {
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

  async getCastFeed(req: FarcasterFeedRequest): Promise<FetchCastsResponse> {
    const response = await this.makeRequest("/feed/casts", {
      method: "POST",
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getFeed(req: FarcasterFeedRequest): Promise<FetchCastsResponse> {
    const response = await this.makeRequest("/feed", {
      method: "POST",
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}
