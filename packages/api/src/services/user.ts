import { FastifyInstance } from "fastify";
import {
  AppClient as FarcasterAuthClient,
  createAppClient,
  viemConnector,
} from "@farcaster/auth-client";
import { SignInWithFarcasterRequest, TokenResponse } from "../../types";
import { PrismaClient } from "@nook/common/prisma/nook";
import { UserMetadata } from "@nook/common/types";

const DEV_USER_FID = 20716;

export class UserService {
  private farcasterAuthClient: FarcasterAuthClient;
  private jwt: FastifyInstance["jwt"];
  private nookClient: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.jwt = fastify.jwt;
    this.farcasterAuthClient = createAppClient({
      ethereum: viemConnector(),
    });
    this.nookClient = fastify.nook.client;
  }

  async signInWithDev(): Promise<TokenResponse | undefined> {
    const user = await this.nookClient.user.findFirst({
      where: {
        fid: DEV_USER_FID.toString(),
      },
    });

    if (!user?.siwfData) return;

    return await this.signInWithFarcaster(
      user.siwfData as SignInWithFarcasterRequest,
    );
  }

  async refreshUser(data: {
    fid: string;
    token: string;
    refreshToken: string;
    expiresAt: number;
    theme?: string;
  }): Promise<TokenResponse | undefined> {
    let user = await this.nookClient.user.findFirst({
      where: {
        fid: data.fid,
      },
    });

    const isNewUser = !user;
    if (!user) {
      user = await this.nookClient.user.create({
        data: {
          fid: data.fid,
          refreshToken: data.refreshToken,
          theme: data.theme,
          signedUpAt: new Date(),
          loggedInAt: new Date(),
          siwfData: {},
          metadata: {
            actionBar: ["reply", "recast", "like"],
          },
        },
      });
    } else {
      user = await this.nookClient.user.update({
        where: {
          fid: data.fid,
        },
        data: {
          fid: data.fid,
          refreshToken: data.refreshToken,
          theme: data.theme,
          loggedInAt: new Date(),
        },
      });
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
      fid: user.fid,
      refreshToken: user.refreshToken,
      token,
      expiresAt,
      theme: user.theme,
      isNewUser,
    };
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

    const fid = verifyResult.fid.toString();
    const refreshToken = this.jwt.sign({
      fid,
    });

    const date = new Date();

    let user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });

    const isNewUser = !user;
    if (!user) {
      user = await this.nookClient.user.create({
        data: {
          fid,
          signedUpAt: date,
          loggedInAt: date,
          refreshToken,
          siwfData: request,
          metadata: {
            actionBar: ["reply", "recast", "like"],
          },
        },
      });
    } else {
      user = await this.nookClient.user.update({
        where: {
          fid,
        },
        data: {
          loggedInAt: date,
          refreshToken,
          siwfData: request,
        },
      });
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
      fid,
      token,
      refreshToken: user.refreshToken,
      expiresAt,
      theme: user.theme,
      isNewUser,
    };
  }

  async getToken(refreshToken: string): Promise<TokenResponse | undefined> {
    const { fid } = this.jwt.verify(refreshToken) as { fid: string };
    const user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });
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
      fid,
      refreshToken,
      token,
      expiresAt,
      theme: user.theme,
    };
  }

  async getUser(fid: string) {
    const user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });

    if (!user) {
      return;
    }

    return {
      ...user,
      siwfData: undefined,
      refreshToken: undefined,
    };
  }

  async updateUser(fid: string, data: { theme: string }) {
    const user = await this.nookClient.user.update({
      where: {
        fid,
      },
      data,
    });

    if (!user) {
      return;
    }

    return {
      fid: user.fid,
      signedUpAt: user.signedUpAt,
      loggedInAt: user.loggedInAt,
      theme: user.theme,
    };
  }

  async updateMetadata(fid: string, metadata: UserMetadata) {
    const user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });

    if (!user) {
      return;
    }

    const existingMetadata = user.metadata as UserMetadata | undefined;

    await this.nookClient.user.update({
      where: {
        fid,
      },
      data: {
        metadata: {
          ...existingMetadata,
          ...metadata,
        },
      },
    });
  }
}
