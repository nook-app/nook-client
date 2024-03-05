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
import { FarcasterClient, NookClient } from "@nook/common/clients";

export class UserService {
  private farcasterAuthClient: FarcasterAuthClient;
  private jwt: FastifyInstance["jwt"];
  private nookClient: NookClient;
  private farcasterClient: FarcasterClient;

  constructor(fastify: FastifyInstance) {
    this.jwt = fastify.jwt;
    this.farcasterAuthClient = createAppClient({
      ethereum: viemConnector(),
    });
    this.nookClient = fastify.nook.client;
    this.farcasterClient = new FarcasterClient();
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

    let entityByFid = await this.nookClient.getEntityByFid(fid);
    if (!entityByFid) {
      entityByFid = await this.nookClient.createEntityByFid(fid);
    }

    const refreshToken = this.jwt.sign({
      id: entityByFid.id,
      fid,
    });

    let user = (await this.nookClient.getEntity(entityByFid.id))?.user;
    if (!user) {
      user = await this.nookClient.createUser(entityByFid.id, refreshToken);
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        id: user.id,
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
    const decoded = this.jwt.verify(refreshToken) as { id: string };
    const entity = await this.nookClient.getEntity(decoded.id);
    if (!entity?.user) {
      return;
    }

    if (entity.user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        id: entity.user.id,
      },
      { expiresIn },
    );

    return {
      refreshToken,
      token,
      expiresAt,
    };
  }

  async getUser(id: string): Promise<GetUserResponse | undefined> {
    const entity = await this.nookClient.getEntity(id);
    if (!entity?.farcaster) {
      return;
    }

    return {
      id: entity.id,
      signerEnabled: entity.farcaster.signerEnabled,
      farcaster: await this.farcasterClient.fetchUser(entity.farcaster.fid),
      nooks: await this.nookClient.getNooksByUser(id),
    };
  }
}
