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
  GetFollowerFidsResponse,
  BaseFarcasterCastWithContext,
  GetFarcasterUsersResponse,
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

  async fetchUser(fid: string) {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/users/${fid}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return await response.json();
  }

  async fetchUsers(fids: string[]): Promise<GetFarcasterUsersResponse> {
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

  async fetchCast(hash: string): Promise<BaseFarcasterCastWithContext> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/${hash}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch cast");
    }
    return await response.json();
  }

  async fetchCasts(hashes: string[]): Promise<GetFarcasterCastsResponse> {
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

  async fetchCastReplies(hash: string): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/${hash}/replies`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch cast replies");
    }
    return await response.json();
  }

  async fetchCastsFromFollowing(
    req: GetFarcasterCastsByFollowingRequest,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-following`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  async fetchCastsFromFids(
    req: GetFarcasterCastsByFidsRequest,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-fids`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  async fetchCastsByParentUrl(
    req: GetFarcasterCastsByParentUrlRequest,
  ): Promise<GetFarcasterCastsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/casts/by-parent-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch casts");
    }

    return await response.json();
  }

  async getFollowerFids(fid: string): Promise<GetFollowerFidsResponse> {
    const response = await fetch(
      `${process.env.FARCASTER_API_ENDPOINT}/users/${fid}/followers/fids`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch followers for ${fid}`);
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
