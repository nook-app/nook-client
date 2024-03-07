import {
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByChannelRequest,
  GetFarcasterCastsByFollowingRequest,
  FarcasterUser,
  GetFarcasterUsersResponse,
  FarcasterCastResponse,
  GetFarcasterCastsResponse,
  Channel,
} from "../../types";
import { BaseClient } from "./base";

export class FarcasterAPIClient extends BaseClient {
  API_ENDPOINT = process.env.FARCASTER_API_ENDPOINT;

  async getChannel(id: string, viewerFid?: string): Promise<Channel> {
    return await this.makeRequest(`/channels/${id}`, { viewerFid });
  }

  async getUser(fid: string, viewerFid?: string): Promise<FarcasterUser> {
    return await this.makeRequest(`/users/${fid}`, { viewerFid });
  }

  async getUserFollowers(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    return await this.makeRequest(
      `/users/${fid}/followers${cursor ? `?cursor=${cursor}` : ""}`,
      {
        viewerFid,
      },
    );
  }

  async getUserFollowing(
    fid: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    return await this.makeRequest(
      `/users/${fid}/following${cursor ? `?cursor=${cursor}` : ""}`,
      {
        viewerFid,
      },
    );
  }

  async getUsers(
    fids: string[],
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    return await this.makeRequest("/users", {
      method: "POST",
      body: JSON.stringify({ fids }),
      viewerFid,
    });
  }

  async getCast(
    hash: string,
    viewerFid?: string,
  ): Promise<FarcasterCastResponse> {
    return await this.makeRequest(`/casts/${hash}`, { viewerFid });
  }

  async getCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts", {
      method: "POST",
      body: JSON.stringify({ hashes }),
      viewerFid,
    });
  }

  async getCastReplies(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest(
      `/casts/${hash}/replies${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );
  }

  async getCastQuotes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest(
      `/casts/${hash}/quotes${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );
  }

  async getCastLikes(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    return await this.makeRequest(
      `/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );
  }

  async getCastRecasts(
    hash: string,
    cursor?: string,
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    return await this.makeRequest(
      `/casts/${hash}/recasts${cursor ? `?cursor=${cursor}` : ""}`,
      { viewerFid },
    );
  }

  async getCastsByFollowing(
    req: GetFarcasterCastsByFollowingRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts/by-following", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });
  }

  async getCastsByFids(
    req: GetFarcasterCastsByFidsRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts/by-fids", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });
  }

  async getCastsByChannel(
    req: GetFarcasterCastsByChannelRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts/by-channel", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });
  }
}
