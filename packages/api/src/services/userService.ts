import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
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
import { Entity, Nook } from "@flink/common/types";
import { PrismaClient } from "@flink/common/prisma/nook";
import { ObjectId } from "mongodb";

export class UserService {
  private client: MongoClient;
  private farcasterAuthClient: FarcasterAuthClient;
  private nookClient: PrismaClient;
  private jwt: FastifyInstance["jwt"];

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
    this.nookClient = fastify.nook.client;
    this.jwt = fastify.jwt;
    this.farcasterAuthClient = createAppClient({
      ethereum: viemConnector(),
    });
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

    const collection = this.client.getCollection<Entity>(
      MongoCollection.Entity,
    );
    const entity = await collection.findOne({
      "farcaster.fid": verifyResult.fid.toString(),
    });

    if (!entity) {
      return;
    }

    const refreshToken = this.jwt.sign({
      id: entity._id.toString(),
    });

    const user = await this.nookClient.user.upsert({
      where: {
        id: entity._id.toString(),
      },
      update: {
        loggedInAt: new Date(),
      },
      create: {
        id: entity._id.toString(),
        signedUpAt: new Date(),
        loggedInAt: new Date(),
        signerEnabled: false,
        refreshToken,
        nookMemberships: {
          createMany: {
            data: [
              {
                nookId: "65cec2e40c6be21bbe973650",
              },
            ],
          },
        },
      },
    });

    const jwtPayload = {
      id: user.id,
    };

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(jwtPayload, { expiresIn });

    return {
      token,
      refreshToken: user.refreshToken,
      expiresAt,
    };
  }

  async getToken(refreshToken: string): Promise<TokenResponse | undefined> {
    const decoded = this.jwt.verify(refreshToken) as { id: string };
    const user = await this.nookClient.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return;
    }

    if (user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const jwtPayload = {
      id: user.id,
    };

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(jwtPayload, { expiresIn });

    return {
      refreshToken,
      token,
      expiresAt,
    };
  }

  async getUser(userId: string): Promise<GetUserResponse | undefined> {
    const user = await this.nookClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        nookMemberships: true,
      },
    });

    if (!user) {
      return;
    }

    const nooks = await this.client
      .getCollection<Nook>(MongoCollection.Nooks)
      .find({
        _id: {
          $in: user.nookMemberships.map((nook) => new ObjectId(nook.nookId)),
        },
      })
      .toArray();

    const entity = await this.client.findEntity(new ObjectId(user.id));
    if (!entity) {
      return;
    }

    return {
      user,
      entity,
      nooks,
    };
  }
}
