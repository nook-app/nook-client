import { FarcasterAPIClient, TokenCacheClient } from "@nook/common/clients";
import {
  TokensFilter,
  TokenHolding,
  TokenHoldings,
  TokenInstance,
  ZerionTokenHoldings,
  ZerionToken,
  Token,
  TokenChart,
  ZerionTokenChart,
  TokenTransactionFilter,
  ZerionTransactions,
  TokenTransactions,
  TokenHolder,
  GetTokenHoldersRequest,
  FarcasterUserV1,
  FetchTokenHoldersResponse,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { formatUnits } from "viem";
import {
  SIMPLEHASH_CHAINS,
  decodeCursor,
  encodeCursor,
} from "@nook/common/utils";
import { refreshTokenOwners } from "@nook/common/queues";

const MAX_PAGE_SIZE = 25;

const ZERION_BASE_URL = "https://api.zerion.io/v1";
const ZERION_API_KEY = process.env.ZERION_API_KEY as string;

const SIMPLEHASH_BASE_URL = "https://api.simplehash.com/api/v0";
const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY as string;

export class TokenService {
  private farcasterApi;
  private cache;

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIClient();
    this.cache = new TokenCacheClient(fastify.feed.client);
  }

  async getTokenMutualsPreview(tokenId: string, viewerFid: string) {
    if (tokenId === "eth") {
      return;
    }

    const cached = await this.cache.getMutuals(tokenId, viewerFid);
    if (cached) {
      return cached;
    }

    let owners = await this.cache.getFarcasterTokenHolders(tokenId);
    if (!owners || owners.length === 0) {
      const refreshed = await this.refreshTokenHolders(tokenId);
      owners = refreshed.filter((o) => o.fid);
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

    await this.cache.setMutuals(tokenId, viewerFid, mutuals);

    return mutuals;
  }

  async getFollowingTokenHolders(
    req: GetTokenHoldersRequest,
    viewerFid: string,
  ) {
    if (req.tokenId === "eth") {
      return { data: [] };
    }

    const getHolders = async () => {
      let collectors = await this.cache.getFarcasterTokenHolders(req.tokenId);
      if (!collectors) {
        await this.refreshTokenHolders(req.tokenId);
        collectors = await this.cache.getFarcasterTokenHolders(req.tokenId);
      }
      return collectors;
    };
    const [collectors, following] = await Promise.all([
      getHolders(),
      this.farcasterApi.getUserFollowingFids(viewerFid),
    ]);

    if (!collectors) {
      return { data: [] };
    }

    const followingCollectors = collectors.filter(
      ({ fid }) => fid && following.data.includes(fid),
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
        user: collector.fid ? userMap[collector.fid] : undefined,
      })),
    };
  }

  async getTokenHolders(
    req: GetTokenHoldersRequest,
  ): Promise<FetchTokenHoldersResponse> {
    if (req.tokenId === "eth") {
      return { data: [] };
    }

    let collectors = (await this.cache.getTokenHolders(req)) as
      | TokenHolder[]
      | undefined;
    if (!collectors) {
      await this.refreshTokenHolders(req.tokenId);
      collectors = await this.cache.getTokenHolders(req);
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

  async getFarcasterTokenHolders(
    req: GetTokenHoldersRequest,
  ): Promise<FetchTokenHoldersResponse> {
    if (req.tokenId === "eth") {
      return { data: [] };
    }

    let collectors = (await this.cache.getTokenHolders(req, true)) as
      | TokenHolder[]
      | undefined;
    if (!collectors) {
      await this.refreshTokenHolders(req.tokenId);
      collectors = await this.cache.getTokenHolders(req, true);
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

  async refreshTokenHolders(tokenId: string) {
    if (tokenId === "eth") {
      return [];
    }

    const token = await this.getToken(tokenId);
    if (!token || token.instances.length === 0) {
      return [];
    }

    const ids = token.instances
      .map((instance) => {
        const simplehashChains = SIMPLEHASH_CHAINS.filter(
          (c) => c.simplehashFungibles,
        );
        const chain = simplehashChains.find(
          (c) => c.simplehashId === instance.chainId,
        );
        if (!chain || !instance.address) {
          return;
        }
        return `${chain.simplehashId}.${instance.address}`;
      })
      .filter(Boolean) as string[];
    if (ids.length === 0) {
      return [];
    }

    const fetchTokenHolders = async (id: string): Promise<TokenHolder[]> => {
      const owners: TokenHolder[] = [];
      let nextCursor: string | undefined;
      do {
        const params: Record<string, string> = {
          fungible_id: id,
          limit: "300",
        };
        if (nextCursor) {
          params.cursor = nextCursor;
        }

        const result: {
          next_cursor: string | undefined;
          owners: {
            owner_address: string;
            quantity: number;
            first_transferred_date: string;
            last_transferred_date: string;
          }[];
        } = await this.makeSimplehashRequest("/fungibles/top_wallets", params);
        if (!result?.owners) {
          nextCursor = undefined;
          continue;
        }
        owners.push(
          ...result.owners.map((owner) => ({
            id,
            chainId: id.split(".")[0],
            address: id.split(".")[1],
            ownerAddress: owner.owner_address,
            quantity: owner.quantity,
            firstTransferredDate: new Date(
              owner.first_transferred_date,
            ).getTime(),
            lastTransferredDate: new Date(
              owner.last_transferred_date,
            ).getTime(),
          })),
        );
        nextCursor = result.next_cursor;
      } while (nextCursor && owners.length < 3000);
      return owners;
    };

    const responses = await Promise.all(ids.map(fetchTokenHolders));
    const mimimums = responses.map((response) =>
      Math.min(...response.map((o) => o.quantity)),
    );
    const maxMin = Math.max(...mimimums);
    const owners = responses
      .flat()
      .filter((o) => o.quantity >= maxMin)
      .sort((a, b) => b.quantity - a.quantity);

    const addresses = owners.map(({ ownerAddress }) => ownerAddress);

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

    const ownersWithFids = owners.map((owner, i) => ({
      ...owner,
      fid: fids[i],
    }));

    await this.cache.setTokenHolders(tokenId, ownersWithFids);

    return ownersWithFids;
  }

  async getToken(tokenId: string): Promise<Token | undefined> {
    const cached = await this.cache.getToken(tokenId);
    if (cached) {
      return cached;
    }

    const response: ZerionToken = await this.makeRequest(
      `/fungibles/${tokenId}`,
    );
    if (!response?.data) {
      return;
    }

    const data = {
      id: response.data.id,
      name: response.data.attributes.name,
      symbol: response.data.attributes.symbol,
      description: response.data.attributes.description,
      icon: response.data.attributes.icon,
      externalLinks: response.data.attributes.external_links,
      instances: response.data.attributes.implementations.map((i) => ({
        chainId: i.chain_id,
        address: i.address,
        decimals: i.decimals,
      })),
      stats: {
        price: response.data.attributes.market_data.price,
        circulatingSupply:
          response.data.attributes.market_data.circulating_supply,
        totalSupply: response.data.attributes.market_data.total_supply,
        marketCap: response.data.attributes.market_data.market_cap,
        fullyDilutedValuation:
          response.data.attributes.market_data.fully_diluted_valuation,
        changes: {
          percent1d: response.data.attributes.market_data.changes.percent_1d,
          percent30d: response.data.attributes.market_data.changes.percent_30d,
          percent90d: response.data.attributes.market_data.changes.percent_90d,
          percent365d:
            response.data.attributes.market_data.changes.percent_365d,
        },
      },
    };

    await this.cache.setToken(tokenId, data);

    return data;
  }

  async getTokenChart(
    tokenId: string,
    timeframe: string,
  ): Promise<TokenChart | undefined> {
    const cached = await this.cache.getTokenChart(tokenId, timeframe);
    if (cached) {
      return cached;
    }

    const response: ZerionTokenChart = await this.makeRequest(
      `/fungibles/${tokenId}/charts/${timeframe}`,
    );
    if (!response?.data) {
      return;
    }

    const data = {
      timeframe,
      beginAt: new Date(response.data.attributes.begin_at).getTime(),
      endAt: new Date(response.data.attributes.end_at).getTime(),
      stats: response.data.attributes.stats,
      points: response.data.attributes.points,
    };

    await this.cache.setTokenChart(tokenId, data);

    return data;
  }

  async getTokens(req: TokensFilter): Promise<TokenHoldings> {
    const cached = await this.cache.getTokenHoldings(req.fid);
    if (cached) {
      return cached;
    }

    const addresses = await this.getAddressesForFid(req.fid);
    if (addresses.length === 0) {
      return {
        data: [],
        addresses: [],
        chains: [],
        tokens: [],
        totalValue: 0,
      };
    }

    const responses: ZerionTokenHoldings[] = await Promise.all(
      addresses.map((address) =>
        this.makeRequest(`/wallets/${address}/positions`),
      ),
    );

    const tokenHoldings: Record<string, TokenHolding> = {};

    for (const response of responses) {
      if (!response?.data || response.data.length === 0) {
        continue;
      }

      for (let i = 0; i < response.data.length; i++) {
        const token = response.data[i];
        const id = token.relationships.fungible.data.id;
        const chainId = token.relationships.chain.data.id;
        if (!tokenHoldings[id]) {
          tokenHoldings[id] = {
            id,
            address: addresses[i],
            name: token.attributes.fungible_info.name,
            symbol: token.attributes.fungible_info.symbol,
            icon: token.attributes.fungible_info.icon,
            value: 0,
            price: 0,
            changes: null,
            quantity: {
              int: "0",
              decimals: 18,
              float: 0,
              numeric: "0",
            },
            instances: [],
          };
        }

        const implementation =
          token.attributes.fungible_info.implementations.find(
            (i) => i.chain_id === chainId,
          );

        if (!implementation) continue;

        const tokenInstance: TokenInstance = {
          chainId,
          address: implementation.address,
          decimals: implementation.decimals,
          value: token.attributes.value || 0,
          price: token.attributes.price,
          changes: token.attributes.changes
            ? {
                absolute1d: token.attributes.changes.absolute_1d,
                percent1d: token.attributes.changes.percent_1d,
              }
            : null,
          quantity: token.attributes.quantity,
          updatedAt: new Date(token.attributes.updated_at).getTime(),
          updatedAtBlock: token.attributes.updated_at_block,
        };

        tokenHoldings[id].instances.push(tokenInstance);
        tokenHoldings[id].price = Math.max(
          tokenHoldings[id].price,
          tokenInstance.price,
        );
        tokenHoldings[id].value += tokenInstance.value;

        const newQuantity =
          BigInt(tokenHoldings[id].quantity.int) +
          BigInt(tokenInstance.quantity.int);
        const newQuantityFloat = parseFloat(
          formatUnits(newQuantity, tokenInstance.quantity.decimals),
        );

        tokenHoldings[id].quantity.int = newQuantity.toString();
        tokenHoldings[id].quantity.decimals = tokenInstance.quantity.decimals;
        tokenHoldings[id].quantity.float = newQuantityFloat;
        tokenHoldings[id].quantity.numeric = newQuantityFloat.toString();
      }
    }

    const data = Object.values(tokenHoldings).sort((a, b) => b.value - a.value);

    const value = {
      data,
      addresses,
      chains: Array.from(
        new Set(data.flatMap((t) => t.instances.map((i) => i.chainId))),
      ),
      tokens: Array.from(new Set(data.map((t) => t.id))),
      totalValue: data.reduce((acc, t) => acc + t.value, 0),
    };

    await this.cache.setTokenHoldings(req.fid, value);

    const tokenIds = data.map((t) => t.id).filter((id) => id !== "eth");
    await refreshTokenOwners(tokenIds);

    return value;
  }

  async getTokenTransactions(
    req: TokenTransactionFilter,
  ): Promise<TokenTransactions> {
    const addresses = await this.getAddressesForFid(req.fid);
    if (addresses.length === 0) {
      return {
        data: [],
        address: "",
      };
    }

    const params: Record<string, string> = {
      "filter[fungible_ids]": req.tokens.join(","),
    };

    if (req.cursor) {
      params["page[after]"] = req.cursor;
    }

    const response: ZerionTransactions = await this.makeRequest(
      `/wallets/${addresses[0]}/transactions`,
      params,
    );
    if (!response?.data) {
      return {
        data: [],
        address: addresses[0],
      };
    }

    let nextCursor: string | undefined;
    if (response.links.next) {
      const parsedUrl = new URL(response.links.next);
      const searchParams = parsedUrl.searchParams;
      nextCursor = searchParams.get("page[after]") || undefined;
    }

    return {
      data: response.data,
      nextCursor,
      address: addresses[0],
    };
  }

  async getAddressesForFid(fid: string) {
    const user = await this.farcasterApi.getUser(fid);
    if (!user?.verifiedAddresses || user.verifiedAddresses.length === 0) {
      return [];
    }

    const addresses = user.verifiedAddresses
      .filter((a) => a.protocol === 0)
      .map((a) => a.address);
    if (addresses.length === 0) {
      return [];
    }

    return addresses;
  }

  async makeRequest(path: string, params?: Record<string, string>) {
    const url = `${ZERION_BASE_URL}${path}?${new URLSearchParams(
      params || {},
    ).toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Basic ${ZERION_API_KEY}`,
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch ${path}: ${response.status}`);
      return;
    }
    return response.json();
  }

  async makeSimplehashRequest(path: string, params?: Record<string, string>) {
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
}
