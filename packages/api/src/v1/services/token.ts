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
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { formatUnits } from "viem";

const ZERION_BASE_URL = "https://api.zerion.io/v1";
const ZERION_API_KEY = process.env.ZERION_API_KEY as string;

export class TokenService {
  private farcasterApi;
  private cache;

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIClient();
    this.cache = new TokenCacheClient(fastify.feed.client);
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

    return {
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

    return {
      timeframe,
      beginAt: new Date(response.data.attributes.begin_at).getTime(),
      endAt: new Date(response.data.attributes.end_at).getTime(),
      stats: response.data.attributes.stats,
      points: response.data.attributes.points,
    };
  }

  async getTokens(req: TokensFilter): Promise<TokenHoldings> {
    const cached = await this.cache.getTokenHoldings(req.fid);
    if (cached) {
      return cached;
    }

    const user = await this.farcasterApi.getUser(req.fid);
    if (!user?.verifiedAddresses || user.verifiedAddresses.length === 0) {
      return { data: [], addresses: [], chains: [], tokens: [], totalValue: 0 };
    }

    const addresses = user.verifiedAddresses
      .filter((a) => a.protocol === 0)
      .map((a) => a.address);
    if (addresses.length === 0) {
      return { data: [], addresses: [], chains: [], tokens: [], totalValue: 0 };
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

    return value;
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
    return response.json();
  }
}
