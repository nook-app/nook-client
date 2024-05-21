import { FarcasterAPIClient } from "@nook/common/clients";
import {
  FetchNftsResponse,
  NftFeedRequest,
  UserFilter,
  UserFilterType,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";

const SIMPLEHASH_BASE_URL = "https://api.simplehash.com/api/v0";
const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY as string;

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

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIClient();
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

    const result = await this.makeRequest("/nfts/owners_v2", params);

    return {
      data: result.nfts,
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

  async makeRequest(path: string, params: Record<string, string>) {
    const url = `${SIMPLEHASH_BASE_URL}${path}?${new URLSearchParams(
      params,
    ).toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-KEY": SIMPLEHASH_API_KEY,
      },
    });
    return response.json();
  }
}
