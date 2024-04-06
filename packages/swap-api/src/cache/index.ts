import { RedisClient } from "@nook/common/clients/cache/base";
import { ZeroXSupportedChain, CoinGeckoMetadata } from "@nook/common/types";
import { ERC20 } from "reverse-mirage";

export class SwapCacheClient {
  private redis: RedisClient;

  SWAP_CACHE_PREFIX = "swap";
  SWAP_ERC20_CACHE_PREFIX = `${this.SWAP_CACHE_PREFIX}:erc20`;
  COINGECKO_CACHE_PREFIX = `${this.SWAP_CACHE_PREFIX}:coingecko`;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async checkCoinGeckoMetadata(chain: ZeroXSupportedChain, address: string) {
    return (
      (await this.redis.exists(
        `${this.SWAP_CACHE_PREFIX}:${chain}:${address}`,
      )) === 1
    );
  }

  async setCoinGeckoMetadata(
    chain: ZeroXSupportedChain,
    address: string,
    info: CoinGeckoMetadata,
  ) {
    const key = `${this.COINGECKO_CACHE_PREFIX}:${chain}:${address}`;
    if (info.image == null) {
      this.redis.setJson(key, info, 3600);
    } else {
      this.redis.setJson(key, info);
    }
  }

  async getCoinGeckoMetadata(
    chain: ZeroXSupportedChain,
    address: string,
  ): Promise<CoinGeckoMetadata | undefined> {
    return await this.redis.getJson(
      `${this.SWAP_CACHE_PREFIX}:${chain}:${address}`,
    );
  }

  async getErc20(
    chain: ZeroXSupportedChain,
    address: string,
  ): Promise<ERC20 | undefined> {
    return await this.redis.getJson(
      `${this.SWAP_CACHE_PREFIX}:${chain}:${address}`,
    );
  }

  async setErc20(chain: ZeroXSupportedChain, address: string, info: ERC20) {
    await this.redis.setJson(
      `${this.SWAP_CACHE_PREFIX}:${chain}:${address}`,
      info,
    );
  }
}
