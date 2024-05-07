import { DegenAPIClient, DegenCacheClient } from "@nook/common/clients";
import { DegenTipAllowance } from "@nook/common/types/degen";
import { FastifyInstance } from "fastify";

export class DegenService {
  private degen: DegenAPIClient;
  private cache: DegenCacheClient;

  constructor(fastify: FastifyInstance) {
    this.degen = new DegenAPIClient();
    this.cache = new DegenCacheClient(fastify.redis.client);
  }

  async checkHasAllowance(fid: string) {
    await this._checkHasAllowanceCache();
    return await this.cache.checkHasAllowance(fid);
  }

  async getAllowance(fid: string): Promise<DegenTipAllowance> {
    // todo: we may want to track remaining balances ourselves, as degen api can be slow
    if (!(await this.checkHasAllowance(fid))) {
      return {
        total: 0n,
        remaining: 0n,
      };
    }

    const response = await this.degen.getIndividualAllowance(fid);
    if (!response) {
      return {
        total: 0n,
        remaining: 0n,
      };
    }

    return {
      total: BigInt(response.tip_allowance),
      remaining: BigInt(response.remaining_allowance),
    };
  }

  async _updateHasAllowance() {
    const response = await this.degen.getAllAllowances();
    const fids = response.map((allowance) => allowance.fid);
    await this.cache.setFidsWithAllowances(fids);
  }

  async _checkHasAllowanceCache() {
    if (!(await this.cache.checkHasAllowanceTtl())) {
      await this._updateHasAllowance();
    }
  }
}
