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
import { EntityClient, NookClient } from "@nook/common/clients";

export class UserService {
  private farcasterAuthClient: FarcasterAuthClient;
  private jwt: FastifyInstance["jwt"];
  private entityClient: EntityClient;
  private nookClient: NookClient;

  constructor(fastify: FastifyInstance) {
    this.jwt = fastify.jwt;
    this.farcasterAuthClient = createAppClient({
      ethereum: viemConnector(),
    });
    this.entityClient = fastify.entity.client;
    this.nookClient = fastify.nook.client;
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

    const fid = "3887";
    // const fid = verifyResult.fid.toString();

    const entity = await this.entityClient.getEntityByFid(BigInt(fid));
    if (!entity) {
      return;
    }

    const refreshToken = this.jwt.sign({
      id: entity.id,
    });

    let user = await this.nookClient.getUser(entity.id);
    if (!user) {
      user = await this.nookClient.createUser(entity.id, refreshToken);
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        id: user.id,
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
    const user = await this.nookClient.getUser(decoded.id);
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
        id: user.id,
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
    const user = await this.nookClient.getUser(id);
    if (!user) {
      return;
    }

    const nooks = await this.nookClient.getNooksByUser(id);
    const entity = await this.entityClient.getEntity(user.id);

    return {
      user,
      entity,
      nooks,
    };
  }
}
