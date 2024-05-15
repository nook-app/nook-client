import {
  ChannelFilterType,
  FarcasterFeedFilter,
  ListItemType,
  ListType,
  ListVisibility,
  UserFilterType,
} from "@nook/common/types";
import { CONTRACTS } from "@nook/common/utils";
import { PrivyClient } from "@privy-io/server-auth";
import { FastifyInstance } from "fastify";
import { createPublicClient, http, parseAbiItem } from "viem";
import { optimism } from "viem/chains";

const DEV_USER_FID = "20716";

export class AuthService {
  private client;
  private viemClient;
  private privyClient;
  private jwt;

  // TODO: Remove after migration period
  private listClient;
  private nookClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.user.client;
    this.viemClient = createPublicClient({
      chain: optimism,
      transport: http(
        "https://opt-mainnet.g.alchemy.com/v2/jrjomnn0ub8MFFQOXz3X9s9oVk_Oj5Q2",
      ),
    });
    this.privyClient = new PrivyClient(
      process.env.PRIVY_APP_ID as string,
      process.env.PRIVY_APP_SECRET as string,
    );
    this.jwt = fastify.jwt;
    this.listClient = fastify.list.client;
    this.nookClient = fastify.nook.client;
  }

  async loginUserWithPassword() {
    return this.loginUserWithFarcaster(DEV_USER_FID);
  }

  async loginUser(token: string) {
    const claim = await this.privyClient.verifyAuthToken(token);
    const user = await this.privyClient.getUser(claim.userId);

    if (user.farcaster) {
      return this.loginUserWithFarcaster(user.farcaster.fid.toString());
    }

    if (user.wallet) {
      return this.loginUserWithWallet(user.wallet.address);
    }
  }

  async loginUserWithFarcaster(fid: string) {
    const now = new Date();
    const refreshToken = this.generateRefreshToken(fid);

    let user = await this.client.user.findFirst({
      where: {
        farcasterAccounts: {
          some: {
            fid: BigInt(fid),
          },
        },
      },
    });

    if (user) {
      await this.client.user.update({
        where: {
          id: user.id,
        },
        data: {
          loggedInAt: now,
          refreshToken,
        },
      });
    } else {
      user = await this.client.user.create({
        data: {
          refreshToken,
          signedUpAt: now,
          loggedInAt: now,
          farcasterAccounts: {
            connectOrCreate: {
              where: {
                fid: BigInt(fid),
              },
              create: {
                fid: BigInt(fid),
              },
            },
          },
        },
      });
    }

    await this.migrateLists(fid, user.id);

    return {
      id: user.id,
      fid,
      token: this.generateToken(user.id.toString(), fid),
      refreshToken,
    };
  }

  async loginUserWithWallet(address: string) {
    const fid = await this.getFidForCustodyAddress(address);
    if (fid) {
      return this.loginUserWithFarcaster(fid);
    }
  }

  async getFidForCustodyAddress(address: string) {
    const result = await this.viemClient.readContract({
      address: CONTRACTS.ID_REGISTRY_ADDRESS,
      abi: [
        parseAbiItem("function idOf(address) external view returns (uint256)"),
      ],
      functionName: "idOf",
      args: [address as `0x${string}`],
    });

    if (result > 0) {
      return result.toString();
    }
  }

  generateRefreshToken(fid: string) {
    return this.jwt.sign({ fid });
  }

  generateToken(id: string, fid: string) {
    const expiresIn = 60 * 60 * 24 * 7;
    return this.jwt.sign(
      {
        id,
        fid,
      },
      { expiresIn },
    );
  }

  async migrateLists(fid: string, id: bigint) {
    const feeds = await this.nookClient.feed.findMany({
      where: {
        fid,
        deletedAt: null,
      },
    });

    if (feeds.length === 0) {
      return;
    }

    for (const feed of feeds) {
      const filter = feed.filter as FarcasterFeedFilter;
      if (filter.users && filter.users.type === UserFilterType.FIDS) {
        await this.listClient.list.create({
          data: {
            creatorId: id,
            type: ListType.USERS,
            name: feed.name,
            visibility: ListVisibility.PRIVATE,
            displayMode: feed.display,
            followerCount: 1,
            followers: {
              create: {
                userId: id,
              },
            },
            itemCount: filter.users.data.fids.length,
            items: {
              create: filter.users.data.fids.map((fid) => ({
                type: ListItemType.FID,
                id: fid,
              })),
            },
          },
        });
      }

      if (
        filter.channels &&
        filter.channels.type === ChannelFilterType.CHANNEL_URLS
      ) {
        await this.listClient.list.create({
          data: {
            creatorId: id,
            type: ListType.PARENT_URLS,
            name: feed.name,
            visibility: ListVisibility.PRIVATE,
            displayMode: feed.display,
            followerCount: 1,
            followers: {
              create: {
                userId: id,
              },
            },
            itemCount: filter.channels.data.urls.length,
            items: {
              create: filter.channels.data.urls.map((url) => ({
                type: ListItemType.PARENT_URL,
                id: url,
              })),
            },
          },
        });
      }
    }
  }
}
