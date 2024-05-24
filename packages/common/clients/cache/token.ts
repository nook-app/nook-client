import { Token, TokenChart, TokenHoldings } from "../../types";
import { RedisClient } from "./base";

export class TokenCacheClient {
  private redis: RedisClient;

  BALANCE_CACHE_PREFIX = "balance";
  TOKEN_CACHE_PREFIX = "token";
  TOKEN_CHART_CACHE_PREFIX = "token:chart";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getTokenHoldings(fid: string): Promise<TokenHoldings | undefined> {
    const key = `${this.BALANCE_CACHE_PREFIX}:${fid}`;
    return await this.redis.getJson(key);
  }

  async setTokenHoldings(
    fid: string,
    tokenHoldings: TokenHoldings,
  ): Promise<void> {
    const key = `${this.BALANCE_CACHE_PREFIX}:${fid}`;
    await this.redis.setJson(key, tokenHoldings, 60 * 10);
  }

  async getToken(tokenId: string): Promise<Token | undefined> {
    const key = `${this.TOKEN_CACHE_PREFIX}:${tokenId}`;
    return await this.redis.getJson(key);
  }

  async setToken(tokenId: string, token: Token): Promise<void> {
    const key = `${this.TOKEN_CACHE_PREFIX}:${tokenId}`;
    await this.redis.setJson(key, token, 60 * 10);
  }

  async getTokenChart(
    tokenId: string,
    timeframe: string,
  ): Promise<TokenChart | undefined> {
    const key = `${this.TOKEN_CHART_CACHE_PREFIX}:${tokenId}:${timeframe}`;
    return await this.redis.getJson(key);
  }

  async setTokenChart(tokenId: string, chart: TokenChart): Promise<void> {
    const key = `${this.TOKEN_CHART_CACHE_PREFIX}:${tokenId}:${chart.timeframe}`;
    await this.redis.setJson(key, chart, 60 * 60);
  }
}
