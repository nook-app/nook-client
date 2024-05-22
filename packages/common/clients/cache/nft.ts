import {
  GetNftCollectionCollectorsRequest,
  GetNftCollectorsRequest,
  NftFarcasterOwner,
  NftMutualsPreview,
  NftOwner,
} from "../../types";
import { decodeCursor } from "../../utils";
import { RedisClient } from "./base";

export class NftCacheClient {
  private redis: RedisClient;

  NFT_MUTUALS_CACHE_PREFIX = "nft-mutuals";
  NFT_OWNERS_CACHE_PREFIX = "nft-owners:nft";
  NFT_COLLECTION_OWNERS_CACHE_PREFIX = "nft-owners:collection";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getMutuals(
    collectionId: string,
    viewerFid: string,
  ): Promise<NftMutualsPreview | undefined> {
    const key = `${this.NFT_MUTUALS_CACHE_PREFIX}:${collectionId}:${viewerFid}`;
    return this.redis.getJson(key);
  }

  async setMutuals(
    collectionId: string,
    viewerFid: string,
    mutuals: NftMutualsPreview,
  ) {
    const key = `${this.NFT_MUTUALS_CACHE_PREFIX}:${collectionId}:${viewerFid}`;
    return this.redis.setJson(key, mutuals, 60 * 60 * 3);
  }

  async getCollectionFarcasterOwners(
    collectionId: string,
    sort: "quantity" | "acquired" = "acquired",
  ): Promise<NftFarcasterOwner[] | undefined> {
    const baseKey = `${this.NFT_COLLECTION_OWNERS_CACHE_PREFIX}:${collectionId}`;
    const data = await this.redis.getAllSetData(`${baseKey}:farcaster:${sort}`);
    if (data.length > 0) {
      return data
        .sort((a, b) => b.score - a.score)
        .map((item) => JSON.parse(item.value));
    }
    const exists = await this.redis.exists(baseKey);
    if (exists) {
      return [];
    }
  }

  async getNftFarcasterOwners(
    nftId: string,
    sort: "quantity" | "acquired" = "acquired",
  ): Promise<NftFarcasterOwner[] | undefined> {
    const baseKey = `${this.NFT_OWNERS_CACHE_PREFIX}:${nftId}`;
    const data = await this.redis.getAllSetData(`${baseKey}:farcaster:${sort}`);
    if (data.length > 0) {
      return data
        .sort((a, b) => b.score - a.score)
        .map((item) => JSON.parse(item.value));
    }
    const exists = await this.redis.exists(baseKey);
    if (exists) {
      return [];
    }
  }

  async setNftOwners(
    collectionId: string,
    owners: NftOwner[],
    farcasterOwners: NftFarcasterOwner[],
  ) {
    const baseKey = `${this.NFT_OWNERS_CACHE_PREFIX}:${collectionId}`;

    await Promise.all([
      this.redis.del(`${baseKey}:quantity`),
      this.redis.del(`${baseKey}:acquired`),
      this.redis.del(`${baseKey}:farcaster:quantity`),
      this.redis.del(`${baseKey}:farcaster:acquired`),
    ]);

    await Promise.all([
      this.redis.set(`${baseKey}`, "1", 60 * 60 * 3),
      this.redis.batchAddToSet(
        `${baseKey}:quantity`,
        owners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.quantity,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:acquired`,
        owners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.lastAcquiredDate,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:farcaster:quantity`,
        farcasterOwners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.quantity,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:farcaster:acquired`,
        farcasterOwners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.lastAcquiredDate,
        })),
        60 * 60 * 3,
      ),
    ]);
  }

  async getNftOwners(req: GetNftCollectorsRequest, onlyFarcaster = false) {
    let key = `${this.NFT_OWNERS_CACHE_PREFIX}:${req.nftId}`;
    if (onlyFarcaster) {
      key = `${key}:farcaster`;
    }
    key = `${key}:${req.sort || "acquired"}`;

    const decodedCursor = decodeCursor(req.cursor);

    const data = await this.redis.getSetPartition(
      key,
      decodedCursor?.page ? Number(decodedCursor.page) * 25 : 0,
    );
    const items = [];
    for (let i = 0; i < data.length; i += 2) {
      items.push(JSON.parse(data[i]));
    }

    if (items.length > 0) {
      return items;
    }

    const exists = await this.redis.exists(
      `${this.NFT_OWNERS_CACHE_PREFIX}:${req.nftId}`,
    );
    if (exists) {
      return [];
    }
  }

  async setCollectionOwners(
    collectionId: string,
    owners: NftOwner[],
    farcasterOwners: NftFarcasterOwner[],
  ) {
    const baseKey = `${this.NFT_COLLECTION_OWNERS_CACHE_PREFIX}:${collectionId}`;

    await Promise.all([
      this.redis.del(`${baseKey}:quantity`),
      this.redis.del(`${baseKey}:acquired`),
      this.redis.del(`${baseKey}:farcaster:quantity`),
      this.redis.del(`${baseKey}:farcaster:acquired`),
    ]);

    await Promise.all([
      this.redis.set(`${baseKey}`, "1", 60 * 60 * 3),
      this.redis.batchAddToSet(
        `${baseKey}:quantity`,
        owners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.quantity,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:acquired`,
        owners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.lastAcquiredDate,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:farcaster:quantity`,
        farcasterOwners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.quantity,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:farcaster:acquired`,
        farcasterOwners.map((owner) => ({
          value: JSON.stringify(owner),
          score: owner.lastAcquiredDate,
        })),
        60 * 60 * 3,
      ),
    ]);
  }

  async getCollectionOwners(
    req: GetNftCollectionCollectorsRequest,
    onlyFarcaster = false,
  ) {
    let key = `${this.NFT_COLLECTION_OWNERS_CACHE_PREFIX}:${req.collectionId}`;
    if (onlyFarcaster) {
      key = `${key}:farcaster`;
    }
    key = `${key}:${req.sort || "acquired"}`;

    const decodedCursor = decodeCursor(req.cursor);

    const data = await this.redis.getSetPartition(
      key,
      decodedCursor?.page ? Number(decodedCursor.page) * 25 : 0,
    );
    const items = [];
    for (let i = 0; i < data.length; i += 2) {
      items.push(JSON.parse(data[i]));
    }

    if (items.length > 0) {
      return items;
    }

    const exists = await this.redis.exists(
      `${this.NFT_COLLECTION_OWNERS_CACHE_PREFIX}:${req.collectionId}`,
    );
    if (exists) {
      return [];
    }
  }
}
