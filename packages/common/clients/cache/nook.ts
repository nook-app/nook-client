import { RedisClient } from "./base";
import { Nook } from "../../types";

export class NookCacheClient extends RedisClient {
  NOOK_CACHE_PREFIX = "nook";

  async getNook(nookId: string): Promise<Nook> {
    return await this.getJson(`${this.NOOK_CACHE_PREFIX}:${nookId}`);
  }

  async setNook(nookId: string, nook: Nook) {
    await this.setJson(`${this.NOOK_CACHE_PREFIX}:${nookId}`, nook);
  }
}
