import {
  HubRpcClient,
  getSSLHubRpcClient,
  Message as HubMessage,
} from "@farcaster/hub-nodejs";
import {
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsResponse,
  GetFarcasterCastsByParentUrlRequest,
  GetFarcasterCastsByFollowingRequest,
  BaseFarcasterCast,
  GetFollowerFidsResponse,
} from "../../types";

export class FarcasterClient {
  private hub: HubRpcClient;

  CAST_CACHE_PREFIX = "cast";
  ENGAGEMENT_CACHE_PREFIX = "engagement";
  CONTENT_CACHE_PREFIX = "content";

  constructor() {
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  }

  async connect() {}

  async close() {
    this.hub.close();
  }

  async getUser(fid: string) {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/users/${fid}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return await response.json();
  }

  async getUsers(fids: string[]) {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fids }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return await response.json();
  }

  async getCast(hash: string): Promise<BaseFarcasterCast> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/${hash}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch cast");
    }
    return await response.json();
  }

  async getCasts(hashes: string[]): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hashes }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }
    return await response.json();
  }

  async getCastReplies(hash: string): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/${hash}/replies`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch cast replies");
    }
    return await response.json();
  }

  async getCastsFromFollowing(
    fid: string,
    cursor?: number,
    limit?: number,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-following`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid,
          cursor,
          limit,
        } as GetFarcasterCastsByFollowingRequest),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  async getCastsFromFids(
    fids: string[],
    replies?: boolean,
    cursor?: number,
    limit?: number,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-fids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fids,
          replies,
          cursor,
          limit,
        } as GetFarcasterCastsByFidsRequest),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  async getCastsByFid(
    fid: string,
    replies?: boolean,
    cursor?: number,
    limit?: number,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-fids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fids: [fid],
          replies,
          cursor,
          limit,
        } as GetFarcasterCastsByFidsRequest),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  async getCastsByParentUrl(
    parentUrl: string,
    cursor?: number,
    limit?: number,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-parent-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentUrl,
          cursor,
          limit,
        } as GetFarcasterCastsByParentUrlRequest),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  getFidsFromCast(cast: BaseFarcasterCast) {
    const fids = new Set<string>();
    fids.add(cast.fid);

    for (const mention of cast.mentions) {
      fids.add(mention.fid);
    }

    return Array.from(fids);
  }

  async getFollowerFids(fid: string): Promise<GetFollowerFidsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/users/${fid}/followers/fids`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch followers");
    }
    return await response.json();
  }

  async getUsernameProof(name: string) {
    const proof = await this.hub.getUsernameProof({
      name: new Uint8Array(Buffer.from(name)),
    });
    if (proof.isErr()) return;
    return proof.value.fid;
  }

  async submitMessage(message: HubMessage): Promise<HubMessage> {
    const result = await this.hub.submitMessage(message);
    if (result.isErr()) {
      throw new Error(result.error.message);
    }
    return result.value;
  }
}
