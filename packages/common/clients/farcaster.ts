import {
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsResponse,
  GetFarcasterCastsByParentUrlRequest,
  GetFarcasterCastsByFollowingRequest,
  BaseFarcasterCastWithContext,
  GetFarcasterUsersResponse,
} from "../types";
import { BaseClient } from "./base";

export class FarcasterClient extends BaseClient {
  API_ENDPOINT = process.env.FARCASTER_API_ENDPOINT;

  async fetchUser(fid: string, viewerFid?: string) {
    return await this.makeRequest(`/users/${fid}`, { viewerFid });
  }

  async fetchUsers(
    fids: string[],
    viewerFid?: string,
  ): Promise<GetFarcasterUsersResponse> {
    return await this.makeRequest("/users", {
      method: "POST",
      body: JSON.stringify({ fids }),
      viewerFid,
    });
  }

  async fetchCast(
    hash: string,
    viewerFid?: string,
  ): Promise<BaseFarcasterCastWithContext> {
    return await this.makeRequest(`/casts/${hash}`, { viewerFid });
  }

  async fetchCasts(
    hashes: string[],
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts", {
      method: "POST",
      body: JSON.stringify({ hashes }),
      viewerFid,
    });
  }

  async fetchCastReplies(
    hash: string,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest(`/casts/${hash}/replies`, { viewerFid });
  }

  async fetchCastsFromFollowing(
    req: GetFarcasterCastsByFollowingRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts/by-following", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });
  }

  async fetchCastsFromFids(
    req: GetFarcasterCastsByFidsRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts/by-fids", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });
  }

  async fetchCastsByParentUrl(
    req: GetFarcasterCastsByParentUrlRequest,
    viewerFid?: string,
  ): Promise<GetFarcasterCastsResponse> {
    return await this.makeRequest("/casts/by-parent-url", {
      method: "POST",
      body: JSON.stringify(req),
      viewerFid,
    });
  }
}
