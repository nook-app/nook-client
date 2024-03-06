import { FastifyInstance } from "fastify";
import {
  AppClient as FarcasterAuthClient,
  createAppClient,
  viemConnector,
} from "@farcaster/auth-client";
import {
  SignInWithFarcasterRequest,
  TokenResponse,
  GetUserResponse,
} from "../../types";
import { FarcasterAPIClient, NookClient } from "@nook/common/clients";

export class UserService {
  private farcasterAuthClient: FarcasterAuthClient;
  private jwt: FastifyInstance["jwt"];
  private nookClient: NookClient;
  private farcasterClient: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.jwt = fastify.jwt;
    this.farcasterAuthClient = createAppClient({
      ethereum: viemConnector(),
    });
    this.nookClient = fastify.nook.client;
    this.farcasterClient = new FarcasterAPIClient();
  }

  async signInWithFarcaster(
    request: SignInWithFarcasterRequest,
  ): Promise<TokenResponse | undefined> {
    const verifyResult = await this.farcasterAuthClient.verifySignInMessage({
      domain: process.env.SIWF_DOMAIN || "localhost:3000",
      ...request,
    });

    if (verifyResult.isError) {
      throw new Error(verifyResult.error?.message || "Sign in failed");
    }

    const fid = "20716";
    // const fid = verifyResult.fid.toString();

    let user = await this.nookClient.getUser(fid);
    if (!user) {
      const refreshToken = this.jwt.sign({
        fid,
      });
      user = await this.nookClient.createUser(fid, refreshToken);
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        fid,
      },
      { expiresIn },
    );

    return {
      token,
      refreshToken: user.refreshToken,
      expiresAt,
    };
  }

  async getToken(refreshToken: string): Promise<TokenResponse | undefined> {
    const decoded = this.jwt.verify(refreshToken) as { fid: string };
    const user = await this.nookClient.getUser(decoded.fid);
    if (!user) {
      return;
    }

    if (user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        fid: user.fid,
      },
      { expiresIn },
    );

    return {
      refreshToken,
      token,
      expiresAt,
    };
  }

  async getUser(fid: string): Promise<GetUserResponse | undefined> {
    const user = await this.nookClient.getUser(fid);
    if (!user) {
      return;
    }

    return {
      fid: user.fid,
      signerEnabled: user.signerEnabled,
      farcaster: await this.farcasterClient.getUser(user.fid),
      nooks: await this.nookClient.getNooksByUser(user.fid),
    };
  }
}
