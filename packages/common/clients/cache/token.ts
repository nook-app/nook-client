import {
  GetTokenHoldersRequest,
  Token,
  TokenChart,
  TokenHolder,
  TokenHoldings,
  TokenMutualsPreview,
} from "../../types";
import { decodeCursor } from "../../utils";
import { RedisClient } from "./base";

export class TokenCacheClient {
  private redis: RedisClient;

  TOKEN_CACHE_PREFIX = "token";
  TOKEN_HOLDINGS_CACHE_PREFIX = "token:holdings";
  TOKEN_CHART_CACHE_PREFIX = "token:chart";
  TOKEN_HOLDERS_CACHE_PREFIX = "token:holders";
  TOKEN_MUTUALS_CACHE_PREFIX = "token-mutuals";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getMutuals(
    tokenId: string,
    viewerFid: string,
  ): Promise<TokenMutualsPreview | undefined> {
    const key = `${this.TOKEN_MUTUALS_CACHE_PREFIX}:${tokenId}:${viewerFid}`;
    return this.redis.getJson(key);
  }

  async setMutuals(
    tokenId: string,
    viewerFid: string,
    mutuals: TokenMutualsPreview,
  ) {
    const key = `${this.TOKEN_MUTUALS_CACHE_PREFIX}:${tokenId}:${viewerFid}`;
    return this.redis.setJson(key, mutuals, 60 * 60 * 3);
  }

  async getTokenHoldings(fid: string): Promise<TokenHoldings | undefined> {
    const key = `${this.TOKEN_HOLDINGS_CACHE_PREFIX}:${fid}`;
    return await this.redis.getJson(key);
  }

  async setTokenHoldings(
    fid: string,
    tokenHoldings: TokenHoldings,
  ): Promise<void> {
    const key = `${this.TOKEN_HOLDINGS_CACHE_PREFIX}:${fid}`;
    await this.redis.setJson(key, tokenHoldings, 60 * 30);
  }

  async getTokens(tokenIds: string[]): Promise<(Token | undefined)[]> {
    const keys = tokenIds.map(
      (tokenId) => `${this.TOKEN_CACHE_PREFIX}:${tokenId}`,
    );
    return await this.redis.mgetJson(keys);
  }

  async getToken(tokenId: string): Promise<Token | undefined> {
    const key = `${this.TOKEN_CACHE_PREFIX}:${tokenId}`;
    return await this.redis.getJson(key);
  }

  async setToken(tokenId: string, token: Token): Promise<void> {
    const key = `${this.TOKEN_CACHE_PREFIX}:${tokenId}`;
    const keys = [
      key,
      ...token.instances.map(
        (instance) =>
          `${this.TOKEN_CACHE_PREFIX}:${instance.chainId}-${instance.address}`,
      ),
    ];
    await this.redis.msetJson(
      keys.map((key) => [key, token]),
      60 * 30,
    );
  }

  async setTokens(tokens: Token[]) {
    const pairs = tokens.flatMap((token) => {
      const tokenPairs = [];
      tokenPairs.push([`${this.TOKEN_CACHE_PREFIX}:${token.id}`, token]);
      for (const instance of token.instances) {
        tokenPairs.push([
          `${this.TOKEN_CACHE_PREFIX}:${instance.chainId}-${instance.address}`,
          token,
        ]);
      }
      return tokenPairs as [string, Token][];
    });

    await this.redis.msetJson(pairs, 60 * 30);
  }

  async setTokensIgnore(tokens: string[]) {
    const pairs = tokens.map((token) => [
      `${this.TOKEN_CACHE_PREFIX}:${token}`,
      {},
    ]) as [string, Token][];
    await this.redis.msetJson(pairs, 60 * 30);
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
    await this.redis.setJson(key, chart, 60 * 30);
  }

  async setTokenHolders(tokenId: string, holders: TokenHolder[]) {
    const baseKey = `${this.TOKEN_HOLDERS_CACHE_PREFIX}:${tokenId}`;

    const farcasterHolders = holders.filter((holder) => holder.fid);

    await Promise.all([
      this.redis.del(`${baseKey}:quantity`),
      this.redis.del(`${baseKey}:farcaster:quantity`),
    ]);

    await Promise.all([
      this.redis.set(`${baseKey}`, "1", 60 * 60 * 3),
      this.redis.batchAddToSet(
        `${baseKey}:quantity`,
        holders.map((holder) => ({
          value: JSON.stringify(holder),
          score: holder.quantity,
        })),
        60 * 60 * 3,
      ),
      this.redis.batchAddToSet(
        `${baseKey}:farcaster:quantity`,
        farcasterHolders.map((holder) => ({
          value: JSON.stringify(holder),
          score: holder.quantity,
        })),
        60 * 60 * 3,
      ),
    ]);
  }

  async getTokenHolders(req: GetTokenHoldersRequest, onlyFarcaster = false) {
    let key = `${this.TOKEN_HOLDERS_CACHE_PREFIX}:${req.tokenId}`;
    if (onlyFarcaster) {
      key = `${key}:farcaster`;
    }
    key = `${key}:quantity`;

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
      `${this.TOKEN_HOLDERS_CACHE_PREFIX}:${req.tokenId}`,
    );
    if (exists) {
      return [];
    }
  }

  async getFarcasterTokenHolders(
    tokenId: string,
  ): Promise<TokenHolder[] | undefined> {
    const baseKey = `${this.TOKEN_HOLDERS_CACHE_PREFIX}:${tokenId}`;
    const data = await this.redis.getAllSetData(
      `${baseKey}:farcaster:quantity`,
    );
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
}
