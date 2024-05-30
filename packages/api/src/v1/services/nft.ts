import { FarcasterAPIClient, NftCacheClient } from "@nook/common/clients";
import {
  FarcasterUserV1,
  FetchNftCollectionsResponse,
  FetchNftCollectorsResponse,
  FetchNftCreatedCollectionsResponse,
  FetchNftEventsResponse,
  FetchNftFarcasterCollectorsResponse,
  FetchNftsResponse,
  GetNftCollectionCollectorsRequest,
  GetNftCollectionEventsRequest,
  GetNftCollectorsRequest,
  GetNftEventsRequest,
  NftFarcasterOwner,
  NftFeedRequest,
  NftAsk,
  NftMarket,
  NftMintStage,
  NftOwner,
  SimpleHashCollection,
  SimpleHashNFT,
  SimpleHashNFTEvent,
  SimplehashNftCollection,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import {
  SIMPLEHASH_CHAINS,
  decodeCursor,
  encodeCursor,
} from "@nook/common/utils";
import { FastifyInstance } from "fastify";
import {
  refreshCollectionOwnerships,
  refreshNftOwners,
} from "@nook/common/queues";

const SIMPLEHASH_BASE_URL = "https://api.simplehash.com/api/v0";
const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY as string;

const MAX_PAGE_SIZE = 25;

const CHAINS: { id: string; crosschainId?: string }[] = [
  { id: "ethereum", crosschainId: "eip155:1" },
  //   { id: "solana", crosschainId: "solana:101" },
  //   { id: "bitcoin" },
  //   { id: "utxo" },
  //   { id: "polygon", crosschainId: "eip155:137" },
  //   { id: "tezos" },
  //   { id: "arbitrum", crosschainId: "eip155:42161" },
  //   { id: "arbitrum-nova", crosschainId: "eip155:42170" },
  //   { id: "avalanche", crosschainId: "eip155:43114" },
  { id: "base", crosschainId: "eip155:8453" },
  //   { id: "blast", crosschainId: "eip155:81457" },
  //   { id: "bsc", crosschainId: "eip155:56" },
  //   { id: "celo", crosschainId: "eip155:42220" },
  { id: "degen", crosschainId: "eip155:666666666" },
  //   { id: "fantom", crosschainId: "eip155:250" },
  //   { id: "flow" },
  //   { id: "gnosis", crosschainId: "eip155:100" },
  //   { id: "godwoken", crosschainId: "eip155:71402" },
  //   { id: "linea", crosschainId: "eip155:59144" },
  //   { id: "loot", crosschainId: "eip155:5151706" },
  //   { id: "manta", crosschainId: "eip155:169" },
  //   { id: "moonbeam", crosschainId: "eip155:1284" },
  { id: "optimism", crosschainId: "eip155:10" },
  //   { id: "palm", crosschainId: "eip155:11297108109" },
  //   { id: "polygon-zkevm", crosschainId: "eip155:1442" },
  //   { id: "proof-of-play", crosschainId: "eip155:70700" },
  //   { id: "rari", crosschainId: "eip155:1380012617" },
  //   { id: "scroll", crosschainId: "eip155:534352" },
  //   { id: "xai", crosschainId: "eip155:660279" },
  //   { id: "zksync-era", crosschainId: "eip155:324" },
  { id: "zora", crosschainId: "eip155:7777777" },
];

export class NftService {
  private farcasterApi;
  private cache;

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIClient();
    this.cache = new NftCacheClient(fastify.feed.client);
  }

  async getNftMutualsPreview(nftId: string, viewerFid: string) {
    const cached = await this.cache.getNftMutuals(nftId, viewerFid);
    if (cached) {
      return cached;
    }

    let owners = await this.cache.getNftFarcasterOwners(nftId);
    if (!owners || owners.length === 0) {
      const refreshed = await this.refreshNftOwners(nftId);
      owners = refreshed.farcasterOwners;
    }

    const following = await this.farcasterApi.getUserFollowingFids(viewerFid);

    const mutualOwners = owners.filter(
      ({ fid }) => fid && following.data.includes(fid),
    );

    const previewFids = mutualOwners
      .map(({ fid }) => fid)
      .slice(0, 3) as string[];

    const previewUsers = await this.farcasterApi.getUsers({
      fids: previewFids,
    });

    const mutuals = {
      preview: previewUsers.data,
      total: mutualOwners.length,
    };

    await this.cache.setNftMutuals(nftId, viewerFid, mutuals);

    return mutuals;
  }

  async getFollowingCollectors(
    req: GetNftCollectorsRequest,
    viewerFid: string,
  ) {
    const getCollectors = async () => {
      let collectors = await this.cache.getNftFarcasterOwners(req.nftId);
      if (!collectors) {
        await this.refreshNftOwners(req.nftId);
        collectors = await this.cache.getNftFarcasterOwners(req.nftId);
      }
      return collectors;
    };
    const [collectors, following] = await Promise.all([
      getCollectors(),
      this.farcasterApi.getUserFollowingFids(viewerFid),
    ]);

    if (!collectors) {
      return { data: [] };
    }

    const followingCollectors = collectors.filter(({ fid }) =>
      following.data.includes(fid),
    );

    const fids = followingCollectors
      .map(({ fid }) => fid)
      .filter(Boolean) as string[];
    const users = await this.farcasterApi.getUsers({ fids }, viewerFid);
    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    return {
      data: followingCollectors.map((collector) => ({
        ...collector,
        user: userMap[collector.fid],
      })),
    };
  }

  async getCollectors(
    req: GetNftCollectorsRequest,
  ): Promise<FetchNftCollectorsResponse> {
    let collectors = (await this.cache.getNftOwners(req)) as
      | NftOwner[]
      | undefined;
    if (!collectors) {
      await this.refreshNftOwners(req.nftId);
      collectors = await this.cache.getNftOwners(req);
    }

    if (!collectors) {
      return { data: [] };
    }

    const decodedCursor = decodeCursor(req.cursor);
    const currentPage = decodedCursor?.page ? Number(decodedCursor.page) : 0;

    const fids = collectors.map(({ fid }) => fid).filter(Boolean) as string[];
    const users = await this.farcasterApi.getUsers({ fids }, req.viewerFid);
    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    return {
      data: collectors.map((collector) => ({
        ...collector,
        user: collector.fid ? userMap[collector.fid] : undefined,
      })),
      nextCursor:
        collectors.length >= MAX_PAGE_SIZE
          ? encodeCursor({
              page: currentPage + 1,
            })
          : undefined,
    };
  }

  async getFarcasterCollectors(
    req: GetNftCollectorsRequest,
  ): Promise<FetchNftFarcasterCollectorsResponse> {
    let collectors = (await this.cache.getNftOwners(req, true)) as
      | NftFarcasterOwner[]
      | undefined;
    if (!collectors) {
      await this.refreshNftOwners(req.nftId);
      collectors = await this.cache.getNftOwners(req, true);
    }
    if (!collectors) {
      return { data: [] };
    }

    const fids = collectors.map(({ fid }) => fid).filter(Boolean) as string[];
    const users = await this.farcasterApi.getUsers({ fids }, req.viewerFid);
    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    const decodedCursor = decodeCursor(req.cursor);
    const currentPage = decodedCursor?.page ? Number(decodedCursor.page) : 0;

    return {
      data: collectors.map((collector) => ({
        ...collector,
        user: userMap[collector.fid],
      })),
      nextCursor:
        collectors.length >= MAX_PAGE_SIZE
          ? encodeCursor({
              page: currentPage + 1,
            })
          : undefined,
    };
  }

  async getCollectionMutualsPreview(collectionId: string, viewerFid: string) {
    const cached = await this.cache.getNftCollectionMutuals(
      collectionId,
      viewerFid,
    );
    if (cached) {
      return cached;
    }

    let owners = await this.cache.getCollectionFarcasterOwners(collectionId);
    if (!owners || owners.length === 0) {
      const refreshed = await this.refreshCollectionOwners(collectionId);
      owners = refreshed.farcasterOwners;
    }

    const following = await this.farcasterApi.getUserFollowingFids(viewerFid);

    const mutualOwners = owners.filter(
      ({ fid }) => fid && following.data.includes(fid),
    );

    const previewFids = mutualOwners
      .map(({ fid }) => fid)
      .slice(0, 3) as string[];

    const previewUsers = await this.farcasterApi.getUsers({
      fids: previewFids,
    });

    const mutuals = {
      preview: previewUsers.data,
      total: mutualOwners.length,
    };

    await this.cache.setNftCollectionMutuals(collectionId, viewerFid, mutuals);

    return mutuals;
  }

  async getCollectionFollowingCollectors(
    req: GetNftCollectionCollectorsRequest,
    viewerFid: string,
  ) {
    const getCollectors = async () => {
      let collectors = await this.cache.getCollectionFarcasterOwners(
        req.collectionId,
      );
      if (!collectors) {
        await this.refreshCollectionOwners(req.collectionId);
        collectors = await this.cache.getCollectionFarcasterOwners(
          req.collectionId,
        );
      }
      return collectors;
    };
    const [collectors, following] = await Promise.all([
      getCollectors(),
      this.farcasterApi.getUserFollowingFids(viewerFid),
    ]);

    if (!collectors) {
      return { data: [] };
    }

    const followingCollectors = collectors.filter(({ fid }) =>
      following.data.includes(fid),
    );

    const fids = followingCollectors
      .map(({ fid }) => fid)
      .filter(Boolean) as string[];
    const users = await this.farcasterApi.getUsers({ fids }, viewerFid);
    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    return {
      data: followingCollectors.map((collector) => ({
        ...collector,
        user: userMap[collector.fid],
      })),
    };
  }

  async getCollectionCollectors(
    req: GetNftCollectionCollectorsRequest,
  ): Promise<FetchNftCollectorsResponse> {
    let collectors = (await this.cache.getCollectionOwners(req)) as
      | NftOwner[]
      | undefined;
    if (!collectors) {
      await this.refreshCollectionOwners(req.collectionId);
      collectors = await this.cache.getCollectionOwners(req);
    }

    if (!collectors) {
      return { data: [] };
    }

    const decodedCursor = decodeCursor(req.cursor);
    const currentPage = decodedCursor?.page ? Number(decodedCursor.page) : 0;

    const fids = collectors.map(({ fid }) => fid).filter(Boolean) as string[];
    const users = await this.farcasterApi.getUsers({ fids }, req.viewerFid);
    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    return {
      data: collectors.map((collector) => ({
        ...collector,
        user: collector.fid ? userMap[collector.fid] : undefined,
      })),
      nextCursor:
        collectors.length >= MAX_PAGE_SIZE
          ? encodeCursor({
              page: currentPage + 1,
            })
          : undefined,
    };
  }

  async getCollectionFarcasterCollectors(
    req: GetNftCollectionCollectorsRequest,
  ): Promise<FetchNftFarcasterCollectorsResponse> {
    let collectors = (await this.cache.getCollectionOwners(req, true)) as
      | NftFarcasterOwner[]
      | undefined;
    if (!collectors) {
      await this.refreshCollectionOwners(req.collectionId);
      collectors = await this.cache.getCollectionOwners(req);
    }
    if (!collectors) {
      return { data: [] };
    }

    const fids = collectors.map(({ fid }) => fid).filter(Boolean) as string[];
    const users = await this.farcasterApi.getUsers({ fids }, req.viewerFid);
    const userMap = users.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    const decodedCursor = decodeCursor(req.cursor);
    const currentPage = decodedCursor?.page ? Number(decodedCursor.page) : 0;

    return {
      data: collectors.map((collector) => ({
        ...collector,
        user: userMap[collector.fid],
      })),
      nextCursor:
        collectors.length >= MAX_PAGE_SIZE
          ? encodeCursor({
              page: currentPage + 1,
            })
          : undefined,
    };
  }

  async refreshNftOwners(nftId: string) {
    const [chain, contractAddress, tokenId] = nftId.split(".");
    const owners: {
      nft_id: string;
      owner_address: string;
      token_id: string;
      quantity: number;
      quantity_string: string;
      first_acquired_date: string;
      last_acquired_date: string;
    }[] = [];

    let nextCursor: string | undefined;
    do {
      const params: Record<string, string> = {
        limit: "1000",
      };
      if (nextCursor) {
        params.cursor = nextCursor;
      }
      const result = await this.makeRequest(
        `/nfts/owners/${chain}/${contractAddress}/${tokenId || 0}`,
        params,
      );
      if (!result?.owners) {
        nextCursor = undefined;
        continue;
      }
      owners.push(...result.owners);
      nextCursor = result.next_cursor;
    } while (nextCursor && owners.length < 50000);

    const addresses = owners.map(({ owner_address }) => owner_address);

    const fidPromises = [];
    for (let i = 0; i < addresses.length; i += 1000) {
      fidPromises.push(
        this.farcasterApi.getUserFids({
          addresses: addresses.slice(i, i + 1000),
        }),
      );
    }
    const fids = await Promise.all(fidPromises).then((results) =>
      results.flatMap((result) => result.data),
    );

    const formatted: NftOwner[] = owners.map((owner, i) => ({
      nftId: owner.nft_id,
      ownerAddress: owner.owner_address,
      tokenId: owner.token_id,
      quantity: owner.quantity,
      firstAcquiredDate: new Date(owner.first_acquired_date).getTime(),
      lastAcquiredDate: new Date(owner.last_acquired_date).getTime(),
      fid: fids[i],
    }));

    const farcasterOwners = this.toFarcasterOwners(formatted);

    await this.cache.setNftOwners(nftId, formatted, farcasterOwners);

    return {
      owners: formatted,
      farcasterOwners,
    };
  }

  async refreshCollectionOwners(collectionId: string) {
    const owners: {
      nft_id: string;
      owner_address: string;
      token_id: string;
      quantity: number;
      quantity_string: string;
      first_acquired_date: string;
      last_acquired_date: string;
    }[] = [];

    let nextCursor: string | undefined;
    do {
      const params: Record<string, string> = {
        limit: "1000",
      };
      if (nextCursor) {
        params.cursor = nextCursor;
      }
      const result = await this.makeRequest(
        `/nfts/owners/collection/${collectionId}`,
        params,
      );
      if (!result?.owners) {
        nextCursor = undefined;
        continue;
      }
      owners.push(...result.owners);
      nextCursor = result.next_cursor;
    } while (nextCursor && owners.length < 50000);

    const addresses = owners.map(({ owner_address }) => owner_address);

    const fidPromises = [];
    for (let i = 0; i < addresses.length; i += 1000) {
      fidPromises.push(
        this.farcasterApi.getUserFids({
          addresses: addresses.slice(i, i + 1000),
        }),
      );
    }
    const fids = await Promise.all(fidPromises).then((results) =>
      results.flatMap((result) => result.data),
    );

    const formatted: NftOwner[] = owners.map((owner, i) => ({
      nftId: owner.nft_id,
      ownerAddress: owner.owner_address,
      tokenId: owner.token_id,
      quantity: owner.quantity,
      firstAcquiredDate: new Date(owner.first_acquired_date).getTime(),
      lastAcquiredDate: new Date(owner.last_acquired_date).getTime(),
      fid: fids[i],
    }));

    const farcasterOwners = this.toFarcasterOwners(formatted);

    await this.cache.setCollectionOwners(
      collectionId,
      formatted,
      farcasterOwners,
    );

    return {
      owners: formatted,
      farcasterOwners,
    };
  }

  async getNftEvents(
    req: GetNftEventsRequest,
  ): Promise<FetchNftEventsResponse> {
    const [chain, contractAddress, tokenId] = req.nftId.split(".");

    const params: Record<string, string> = {
      order_by: "timestamp_desc",
      limit: "25",
      include_nft_details: "1",
    };

    if (req.cursor) {
      params.cursor = req.cursor;
    }

    const result: {
      transfers: SimpleHashNFTEvent[];
      next_cursor?: string;
    } = await this.makeRequest(
      `/nfts/transfers/${chain}/${contractAddress}/${tokenId || 0}`,
      params,
    );
    if (!result?.transfers) {
      return { data: [] };
    }

    const addresses = result.transfers.flatMap(
      ({ from_address, to_address }) => {
        const addresses = [];
        if (from_address) {
          addresses.push(from_address);
        }
        if (to_address) {
          addresses.push(to_address);
        }
        return addresses;
      },
    );

    const users = await this.farcasterApi.getUsers({ addresses });
    const userMap = users.data.reduce(
      (acc, user) => {
        for (const address of user.verifiedAddresses || []) {
          acc[address.address] = user;
        }
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    return {
      data: result.transfers.map((event) => ({
        ...event,
        from_user: event.from_address
          ? userMap[event.from_address.toLowerCase()]
          : undefined,
        to_user: event.to_address
          ? userMap[event.to_address.toLowerCase()]
          : undefined,
      })),
      nextCursor: result.next_cursor,
    };
  }

  async getNftCollectionEvents(
    req: GetNftCollectionEventsRequest,
  ): Promise<FetchNftEventsResponse> {
    const params: Record<string, string> = {
      order_by: "timestamp_desc",
      limit: "25",
      include_nft_details: "1",
    };

    if (req.cursor) {
      params.cursor = req.cursor;
    }

    const result: {
      transfers: SimpleHashNFTEvent[];
      next_cursor?: string;
    } = await this.makeRequest(
      `/nfts/transfers/collection/${req.collectionId}`,
      params,
    );
    if (!result?.transfers) {
      return { data: [] };
    }

    const addresses = result.transfers.flatMap(
      ({ from_address, to_address }) => {
        const addresses = [];
        if (from_address) {
          addresses.push(from_address);
        }
        if (to_address) {
          addresses.push(to_address);
        }
        return addresses;
      },
    );

    const users = await this.farcasterApi.getUsers({ addresses });
    const userMap = users.data.reduce(
      (acc, user) => {
        for (const address of user.verifiedAddresses || []) {
          acc[address.address] = user;
        }
        return acc;
      },
      {} as Record<string, FarcasterUserV1>,
    );

    return {
      data: result.transfers.map((event) => ({
        ...event,
        from_user: event.from_address
          ? userMap[event.from_address.toLowerCase()]
          : undefined,
        to_user: event.to_address
          ? userMap[event.to_address.toLowerCase()]
          : undefined,
      })),
      nextCursor: result.next_cursor,
    };
  }

  async getNft(nftId: string): Promise<SimpleHashNFT> {
    const cached = await this.cache.getNft(nftId);
    if (cached) {
      return cached;
    }

    const [chain, contractAddress, tokenId] = nftId.split(".");
    const nft = await this.makeRequest(
      `/nfts/${chain}/${contractAddress}/${tokenId || 0}`,
    );
    if (nft) {
      await this.cache.setNft(nftId, nft);
    }

    return nft;
  }

  async getNftMarkets(nftId: string): Promise<NftMarket | undefined> {
    const cached = await this.cache.getNftMarket(nftId);
    if (cached) {
      return cached;
    }

    const [chainId, contractAddress, tokenId] = nftId.split(".");
    const chain = SIMPLEHASH_CHAINS.find((c) => c.simplehashId === chainId);
    if (!chain?.reservoirId) return;
    const response: {
      tokens: {
        token: {
          contract: string;
          tokenId: string;
          mintStages: NftMintStage[];
        };
        market: { floorAsk: NftAsk; topBid: NftAsk };
      }[];
    } = await this.makeReservoirRequest(chain.reservoirId, "/tokens/v7", {
      tokens: `${contractAddress}:${tokenId}`,
      includeMintStages: "true",
      includeTopBid: "true",
    });
    if (!response) return;

    const token = response.tokens.find(
      ({ token }) =>
        token.contract === contractAddress && token.tokenId === tokenId,
    );
    if (!token) return;

    const data: NftMarket = {
      mintStages: token.token.mintStages,
      market: token.market,
    };

    await this.cache.setNftMarket(nftId, data);

    return data;
  }

  async getNftCollectionNfts(collectionId: string, cursor?: string) {
    const params: Record<string, string> = {
      limit: "24",
    };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await this.makeRequest(
      `/nfts/collection/${collectionId}`,
      params,
    );

    return {
      data: response?.nfts || [],
      nextCursor: response?.next_cursor,
    };
  }

  async getNftCollection(collectionId: string) {
    const response = await this.makeRequest("/nfts/collections/ids", {
      collection_ids: collectionId,
    });

    return response?.collections?.[0];
  }

  async getNfts(request: NftFeedRequest): Promise<FetchNftsResponse> {
    const addresses = await this.getAddressesForUserFilter(
      request.filter.users,
    );
    if (!addresses) {
      return { data: [] };
    }

    const params: Record<string, string> = {
      chains: CHAINS.map(({ id }) => id).join(","),
      wallet_addresses: addresses.join(","),
      queried_wallet_balances: "1",
      limit: "24",
      filters: "spam_score__lte=90",
    };

    if (request.cursor) {
      params.cursor = request.cursor;
    }

    if (request.filter.orderBy) {
      params.order_by = request.filter.orderBy;
    }

    const result: { nfts: SimpleHashNFT[]; next_cursor?: string } =
      await this.makeRequest("/nfts/owners_v2", params);
    if (!result?.nfts) {
      return { data: [] };
    }

    const collectionIds = new Set<string>();
    for (const nft of result.nfts) {
      if (!nft.collection.collection_id) continue;
      collectionIds.add(nft.collection.collection_id);
    }

    const nftIds = new Set<string>();
    for (const nft of result.nfts) {
      nftIds.add(nft.nft_id);
    }

    await Promise.all([
      refreshCollectionOwnerships(Array.from(collectionIds)),
      refreshNftOwners(Array.from(nftIds)),
    ]);

    return {
      data: result.nfts,
      nextCursor: result.next_cursor,
    };
  }

  async getNftsCreated(request: NftFeedRequest): Promise<FetchNftsResponse> {
    const addresses = await this.getAddressesForUserFilter(
      request.filter.users,
    );
    if (!addresses) {
      return { data: [] };
    }

    const params: Record<string, string> = {
      chains: CHAINS.map(({ id }) => id).join(","),
      wallet_addresses: addresses.join(","),
      limit: "24",
    };

    if (request.cursor) {
      params.cursor = request.cursor;
    }

    const result: { nfts: SimpleHashNFT[]; next_cursor?: string } =
      await this.makeRequest("/nfts/contract_owner", params);
    if (!result?.nfts) {
      return { data: [] };
    }

    const collectionIds = new Set<string>();
    for (const nft of result.nfts) {
      if (!nft.collection.collection_id) continue;
      collectionIds.add(nft.collection.collection_id);
    }

    const nftIds = new Set<string>();
    for (const nft of result.nfts) {
      nftIds.add(nft.nft_id);
    }

    await refreshCollectionOwnerships(Array.from(collectionIds));
    await refreshNftOwners(Array.from(nftIds));

    return {
      data: result.nfts,
      nextCursor: result.next_cursor,
    };
  }

  async getNftCollections(
    request: NftFeedRequest,
  ): Promise<FetchNftCollectionsResponse> {
    const addresses = await this.getAddressesForUserFilter(
      request.filter.users,
    );
    if (!addresses) {
      return { data: [] };
    }

    const params: Record<string, string> = {
      chains: CHAINS.map(({ id }) => id).join(","),
      wallet_addresses: addresses.join(","),
      limit: "24",
      spam_score__lt: "90",
    };

    if (request.cursor) {
      params.cursor = request.cursor;
    }

    if (request.filter.orderBy) {
      params.order_by = request.filter.orderBy;
    }

    const result: {
      collections: SimplehashNftCollection[];
      next_cursor?: string;
    } = await this.makeRequest("/nfts/collections_by_wallets_v2", params);
    if (!result?.collections) {
      return { data: [] };
    }

    await refreshCollectionOwnerships(
      result.collections.map((c) => c.collection_id),
    );

    return {
      data: result.collections,
      nextCursor: result.next_cursor,
    };
  }

  async getNftCollectionsCreated(
    request: NftFeedRequest,
  ): Promise<FetchNftCreatedCollectionsResponse> {
    const addresses = await this.getAddressesForUserFilter(
      request.filter.users,
    );
    if (!addresses) {
      return { data: [] };
    }

    const params: Record<string, string> = {
      chains: CHAINS.map(({ id }) => id).join(","),
      wallet_addresses: addresses.join(","),
      limit: "24",
    };

    if (request.cursor) {
      params.cursor = request.cursor;
    }

    const result: {
      contracts: {
        deployment_date: string;
        top_collections: SimpleHashCollection[];
      }[];
      next_cursor?: string;
    } = await this.makeRequest("/contracts_by_owner", params);
    if (!result?.contracts) {
      return { data: [] };
    }

    const collections = result.contracts.flatMap(
      ({ top_collections, deployment_date }) =>
        top_collections.map((c) => ({
          ...c,
          deployment_date,
        })),
    );
    await refreshCollectionOwnerships(collections.map((c) => c.collection_id));

    return {
      data: collections.sort(
        (a, b) =>
          new Date(b.deployment_date).getTime() -
          new Date(a.deployment_date).getTime(),
      ),
      nextCursor: result.next_cursor,
    };
  }

  async getAddressesForUserFilter(filter: UserFilter) {
    switch (filter.type) {
      case UserFilterType.FID: {
        const user = await this.farcasterApi.getUser(filter.data.fid);
        return user.verifiedAddresses?.map(({ address }) =>
          address.toLowerCase(),
        );
      }
      default:
        return;
    }
  }

  async makeRequest(path: string, params?: Record<string, string>) {
    const url = `${SIMPLEHASH_BASE_URL}${path}?${new URLSearchParams(
      params || {},
    ).toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-KEY": SIMPLEHASH_API_KEY,
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch ${path}: ${response.status}`);
      return;
    }
    return response.json();
  }

  async makeReservoirRequest(
    chain: string,
    path: string,
    params?: Record<string, string>,
  ) {
    const url = `https://api${
      chain !== "" ? `-${chain}` : ""
    }.reservoir.tools${path}?${new URLSearchParams(params || {}).toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-KEY": SIMPLEHASH_API_KEY,
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch ${path}: ${response.status}`);
      return;
    }
    return response.json();
  }

  toFarcasterOwners(owners: NftOwner[]): NftFarcasterOwner[] {
    const farcasterOwners = owners.reduce(
      (acc, owner) => {
        if (!owner.fid) return acc;
        if (!acc[owner.fid]) {
          acc[owner.fid] = {
            fid: owner.fid,
            quantity: 0,
            firstAcquiredDate: Infinity,
            lastAcquiredDate: 0,
            tokens: [],
          };
        }
        acc[owner.fid].quantity += owner.quantity;
        acc[owner.fid].firstAcquiredDate = Math.min(
          acc[owner.fid].firstAcquiredDate,
          owner.firstAcquiredDate,
        );
        acc[owner.fid].lastAcquiredDate = Math.max(
          acc[owner.fid].lastAcquiredDate,
          owner.lastAcquiredDate,
        );
        acc[owner.fid].tokens.push(owner);
        return acc;
      },
      {} as Record<string, NftFarcasterOwner>,
    );

    return Object.values(farcasterOwners);
  }
}
