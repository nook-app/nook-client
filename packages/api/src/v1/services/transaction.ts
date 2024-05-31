import {
  FarcasterAPIV1Client,
  NftCacheClient,
  TokenCacheClient,
} from "@nook/common/clients";
import {
  FarcasterUserV1,
  FetchTransactionsResponseV1,
  NFTWithMarket,
  NftAsk,
  NftMarket,
  NftMintStage,
  OnceUponTransactions,
  PartyEnriched,
  SimpleHashNFT,
  Token,
  TransactionFeedRequest,
  ZerionToken,
} from "@nook/common/types";
import { TokenData } from "@nook/common/types/providers/zerion/token";
import { CHAINS, SIMPLEHASH_CHAINS } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

const ONCEUPON_BASE_URL = "https://api.onceupon.gg/v3";

const ZERION_BASE_URL = "https://api.zerion.io/v1";
const ZERION_API_KEY = process.env.ZERION_API_KEY as string;

const SIMPLEHASH_BASE_URL = "https://api.simplehash.com/api/v0";
const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY as string;

export class TransactionService {
  private farcasterApi;
  private tokenCache;
  private nftCache;

  constructor(fastify: FastifyInstance) {
    this.farcasterApi = new FarcasterAPIV1Client();
    this.tokenCache = new TokenCacheClient(fastify.feed.client);
    this.nftCache = new NftCacheClient(fastify.feed.client);
  }

  async getTransactions(
    req: TransactionFeedRequest,
    viewerFid?: string,
  ): Promise<FetchTransactionsResponseV1> {
    const users = await this.farcasterApi.getUsers(
      { filter: req.filter.users },
      viewerFid,
    );

    const addressToUser: Record<string, FarcasterUserV1> = {};
    const fidToUser: Record<string, FarcasterUserV1> = {};
    for (const user of users.data) {
      fidToUser[user.fid] = user;
      for (const address of user.verifiedAddresses ?? []) {
        if (address.protocol !== 0) continue;
        addressToUser[address.address.toLowerCase()] = user;
      }
    }

    const addresses = Object.keys(addressToUser).map((address) => ({
      address,
      toFromAll: "From",
    }));

    let chainIds = req.filter.chains;
    if (!chainIds || chainIds.length === 0) {
      chainIds = [0];
    }

    let contextActions = req.filter.contextActions;
    if (!contextActions || contextActions.length === 0) {
      contextActions = ["MINTED", "SWAPPED"];
    }

    const response: OnceUponTransactions = await this.makeRequest(
      "/transactions",
      {
        contextAddresses: addresses.slice(0, 1000),
        filterAddresses: [],
        contextActions,
        functionSelectors: [],
        chainIds: Object.values(CHAINS).map(({ chainId }) => chainId),
        sort: -1,
        cursor: req.cursor,
        includes: ["partiesEnriched"],
      },
    );

    if (!response) {
      return { data: [] };
    }

    const missingParties = new Set<string>();
    for (const tx of response.transactions) {
      if (!addressToUser[tx.from]) {
        missingParties.add(tx.from);
      }
      if (!addressToUser[tx.to]) {
        missingParties.add(tx.to);
      }
      for (const variable of Object.values(tx.context.variables)) {
        if (variable.type === "address" && !addressToUser[variable.value]) {
          missingParties.add(variable.value);
        }
      }
    }

    const missingTokens = new Set<string>();
    const missingCollectibles = new Set<string>();
    for (const tx of response.transactions) {
      const chain = CHAINS[`eip155:${tx.chainId}`];
      if (!tx.assetTransfers) continue;
      for (const asset of tx.assetTransfers) {
        if (chain?.zerionId && asset.type === "erc20" && asset.contract) {
          missingTokens.add(`${chain.zerionId}-${asset.contract}`);
        }
        if (
          chain?.simplehashId &&
          (asset.type === "erc721" || asset.type === "erc1155") &&
          asset.contract &&
          asset.tokenId
        ) {
          missingCollectibles.add(
            `${chain.simplehashId}.${asset.contract}.${asset.tokenId}`,
          );
        }
      }
    }

    const [partyUsers, tokens, collectibles] = await Promise.all([
      this.farcasterApi.getUsers({ addresses: Array.from(missingParties) }),
      this.getTokens(Array.from(missingTokens)),
      this.getCollectibles(Array.from(missingCollectibles)),
    ]);

    for (const user of partyUsers.data) {
      for (const address of user.verifiedAddresses ?? []) {
        if (address.protocol !== 0) continue;
        addressToUser[address.address.toLowerCase()] = user;
      }
    }

    const tokenMap = tokens.reduce(
      (acc, token) => {
        if (!token?.instances) return acc;
        for (const instance of token.instances) {
          if (!instance?.address) continue;
          acc[instance.address] = token;
        }
        return acc;
      },
      {} as Record<string, Token>,
    );

    const collectibleMap = collectibles.reduce(
      (acc, nft) => {
        if (!nft) return acc;
        acc[nft.nft_id] = nft;
        return acc;
      },
      {} as Record<string, NFTWithMarket>,
    );

    return {
      data: response.transactions.map((tx) => {
        const chain = CHAINS[`eip155:${tx.chainId}`];
        const txTokens = [];
        const txCollectibles = [];
        if (tx.assetTransfers) {
          for (const asset of tx.assetTransfers) {
            if (chain?.zerionId && asset.type === "erc20" && asset.contract) {
              txTokens.push(asset.contract);
            }
            if (
              chain?.simplehashId &&
              (asset.type === "erc721" || asset.type === "erc1155") &&
              asset.contract &&
              asset.tokenId
            ) {
              txCollectibles.push(
                `${chain.simplehashId}.${asset.contract}.${asset.tokenId}`,
              );
            }
          }
        }

        return {
          ...tx,
          users:
            tx.parties?.reduce(
              (acc, party) => {
                if (!addressToUser[party]) return acc;
                acc[party] = addressToUser[party];
                return acc;
              },
              {} as Record<string, FarcasterUserV1>,
            ) || {},
          tokens: txTokens.reduce(
            (acc, token) => {
              if (!tokenMap[token]) return acc;
              acc[token] = tokenMap[token];
              return acc;
            },
            {} as Record<string, Token>,
          ),
          collectibles: txCollectibles.reduce(
            (acc, nft) => {
              if (!collectibleMap[nft]) return acc;
              acc[nft] = collectibleMap[nft];
              return acc;
            },
            {} as Record<string, NFTWithMarket>,
          ),
          enrichedParties:
            tx.parties?.reduce(
              (acc, party) => {
                if (!response.partiesEnriched[party]) return acc;
                const enrichedParty = response.partiesEnriched[party].find(
                  ({ chainId }) => chainId === tx.chainId,
                );
                if (!enrichedParty) return acc;
                acc[party] = enrichedParty;
                return acc;
              },
              {} as Record<string, PartyEnriched>,
            ) || {},
        };
      }),
      nextCursor: response?.cursor,
    };
  }

  async getTokens(tokenIds: string[]) {
    const cached = await this.tokenCache.getTokens(tokenIds);
    const cacheMap = cached.reduce(
      (acc, token, i) => {
        if (!token) return acc;
        acc[tokenIds[i]] = token;
        return acc;
      },
      {} as Record<string, Token>,
    );
    const ignoreMap = cached.reduce(
      (acc, token, i) => {
        if (!token || Object.keys(token).length !== 0) return acc;
        acc[tokenIds[i]] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    try {
      const missing = tokenIds.filter((id) => !cacheMap[id] && !ignoreMap[id]);
      if (missing.length > 0) {
        const tokens = await Promise.all(
          missing.map(async (id) => {
            const [chainId, address] = id.split("-");
            const response: { data: TokenData[] } =
              await this.makeZerionRequest("/fungibles", {
                "filter[implementation_chain_id]": chainId,
                "filter[implementation_address]": address,
              });

            const data = response?.data[0];
            if (!data) return;

            const instances = data.attributes.implementations.map((i) => ({
              chainId: i.chain_id,
              address: i.address,
              decimals: i.decimals,
            }));

            return {
              id: data.id,
              name: data.attributes.name,
              symbol: data.attributes.symbol,
              description: data.attributes.description,
              icon: data.attributes.icon,
              externalLinks: data.attributes.external_links,
              instances,
              stats: {
                price: data.attributes.market_data.price,
                circulatingSupply:
                  data.attributes.market_data.circulating_supply,
                totalSupply: data.attributes.market_data.total_supply,
                marketCap: data.attributes.market_data.market_cap,
                fullyDilutedValuation:
                  data.attributes.market_data.fully_diluted_valuation,
                changes: {
                  percent1d: data.attributes.market_data.changes.percent_1d,
                  percent30d: data.attributes.market_data.changes.percent_30d,
                  percent90d: data.attributes.market_data.changes.percent_90d,
                  percent365d: data.attributes.market_data.changes.percent_365d,
                },
              },
            };
          }),
        );

        for (const token of tokens) {
          if (!token?.instances) continue;
          for (const instance of token.instances) {
            cacheMap[`${instance.chainId}-${instance.address}`] = token;
          }
        }

        await this.tokenCache.setTokens(tokens.filter(Boolean) as Token[]);
      }

      const stillMissing = tokenIds.filter((id) => !cacheMap[id]);
      if (stillMissing.length > 0) {
        await this.tokenCache.setTokensIgnore(stillMissing);
      }
    } catch (e) {
      console.error(e);
    }

    return tokenIds.map((id) => cacheMap[id]);
  }

  async getCollectibles(tokenIds: string[]) {
    const cached = await this.nftCache.getNfts(tokenIds);
    const cacheMap = cached.reduce(
      (acc, nft, i) => {
        if (!nft) return acc;
        acc[tokenIds[i]] = nft;
        return acc;
      },
      {} as Record<string, NFTWithMarket>,
    );

    const ignoreMap = cached.reduce(
      (acc, nft, i) => {
        if (!nft || Object.keys(nft).length !== 0) return acc;
        acc[tokenIds[i]] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    const missing = tokenIds.filter((id) => !cacheMap[id] && !ignoreMap[id]);
    if (missing.length > 0) {
      const getNfts = async (
        ids: string[],
      ): Promise<{ nfts: SimpleHashNFT[] }> => {
        return await this.makeSimplehashRequest("/nfts/assets", {
          nft_ids: ids.join(","),
        });
      };

      const [response, markets] = await Promise.all([
        getNfts(missing),
        this.getMarkets(missing),
      ]);

      const nfts = [];

      for (const nft of response.nfts) {
        if (!nft) continue;
        nfts.push({
          ...nft,
          ...markets[nft.nft_id],
        });
        cacheMap[nft.nft_id] = {
          ...nft,
          ...markets[nft.nft_id],
        };
      }

      await this.nftCache.setNfts(nfts);
    }

    const stillMissing = tokenIds.filter((id) => !cacheMap[id]);
    if (stillMissing.length > 0) {
      await this.nftCache.setNftsIgnore(stillMissing);
    }

    return tokenIds.map((id) => cacheMap[id]);
  }

  async getMarkets(tokenIds: string[]) {
    const tokensByChain = tokenIds.reduce(
      (acc, token) => {
        const [chainId] = token.split(".");
        const chain = SIMPLEHASH_CHAINS.find((c) => c.simplehashId === chainId);
        if (!chain?.reservoirId) return acc;
        if (!acc[chain.reservoirId]) acc[chain.reservoirId] = [];
        acc[chain.reservoirId].push(token);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const responses = await Promise.all(
      Object.entries(tokensByChain).map(async ([chainId, tokens]) => {
        const tokenIds = tokens.map((token) => {
          const [_, contractAddress, tokenId] = token.split(".");
          return `${contractAddress}:${tokenId}`;
        });
        const response: {
          tokens: {
            token: {
              contract: string;
              tokenId: string;
              mintStages: NftMintStage[];
            };
            market: { floorAsk: NftAsk; topBid: NftAsk };
          }[];
        } = await this.makeReservoirRequest(chainId, "/tokens/v7", {
          tokens: tokenIds,
          includeMintStages: "true",
          includeTopBid: "true",
        });
        if (!response) return [];
        return response.tokens;
      }),
    );

    const tokens = responses.flat();

    return tokenIds.reduce(
      (acc, token) => {
        const [_, contractAddress, tokenId] = token.split(".");
        const market = tokens.find(
          ({ token }) =>
            token.contract === contractAddress && token.tokenId === tokenId,
        );
        if (!market) return acc;
        acc[token] = {
          mintStages: market.token.mintStages,
          market: market.market,
        };
        return acc;
      },
      {} as Record<string, NftMarket>,
    );
  }

  // biome-ignore lint/suspicious/noExplicitAny: request body
  async makeRequest(path: string, body?: Record<string, any>) {
    const response = await fetch(`${ONCEUPON_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      console.error(
        `Failed to fetch ${path}: ${response.status} ${await response.text()}`,
      );
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

  async makeZerionRequest(path: string, params?: Record<string, string>) {
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
      throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }
    return response.json();
  }

  async makeReservoirRequest(
    chain: string,
    path: string,
    params?: Record<string, string | string[]>,
  ) {
    const urlParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          for (const v of value) {
            urlParams.append(key, v);
          }
        } else {
          urlParams.append(key, value);
        }
      }
    }

    const url = `https://api${
      chain !== "" ? `-${chain}` : ""
    }.reservoir.tools${path}?${urlParams.toString()}`;
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
