import {
  FarcasterUser,
  GetFarcasterUsersResponse,
  FarcasterCastResponse,
  GetFarcasterCastsResponse,
  Channel,
  GetFarcasterUsersRequest,
  GetFarcasterChannelsRequest,
  GetFarcasterChannelResponse,
  ShelfDataRequest,
  FarcasterPostArgs,
  ShelfDataResponse,
} from "../../types";
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

  async getChannels(
    req: GetFarcasterChannelsRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterChannelResponse> {
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

  async getUser(fid: string, viewerFid?: string): Promise<FarcasterUser> {
    const response = await this.makeRequest(`/users/${fid}`, { viewerFid });

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

  async getCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse | undefined> {
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
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    const response = await this.makeRequest(
      `/users?query=${query}&${cursor ? `&cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async searchChannels(
    query: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<Channel[]> {
    const response = await this.makeRequest(
      `/channels?query=${query}&${cursor ? `&cursor=${cursor}` : ""}`,
      { viewerFid },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async getNewPosts(
    req: ShelfDataRequest<FarcasterPostArgs>,
  ): Promise<ShelfDataResponse<FarcasterCastResponse>> {
    const response = await this.makeRequest("/feed/posts/new", {
      method: "POST",
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }
}
