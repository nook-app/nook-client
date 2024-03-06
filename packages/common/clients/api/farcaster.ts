import {
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByChannelRequest,
  GetFarcasterCastsByFollowingRequest,
  FarcasterUser,
  GetFarcasterUsersResponse,
  FarcasterCastResponse,
  GetFarcasterCastsResponse,
} from "../../types";
import { BaseClient } from "./base";

export class FarcasterAPIClient extends BaseClient {
  API_ENDPOINT = process.env.FARCASTER_API_ENDPOINT;

  async getUser(fid: string, viewerFid?: string): Promise<FarcasterUser> {
    return await this.makeRequest(`/users/${fid}`, { viewerFid });
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
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest(`/casts/${hash}/replies`, { viewerFid });
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
