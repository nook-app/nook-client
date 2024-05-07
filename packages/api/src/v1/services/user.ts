import { CONTRACTS } from "@nook/common/utils";
import { PrivyClient } from "@privy-io/server-auth";
import { FastifyInstance } from "fastify";
import { createPublicClient, http, parseAbiItem } from "viem";
import { optimism } from "viem/chains";

export class UserService {
  private client;
  private viemClient;
  private privyClient;
  private jwt;

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
  }

  async loginUser(token: string) {
    const claim = await this.privyClient.verifyAuthToken(token);
    const user = await this.privyClient.getUser(claim.userId);

    if (user.farcaster) {
      return this.loginUserWithFarcaster(user.farcaster.fid.toString());
    }

    if (user.wallet) {
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
}
