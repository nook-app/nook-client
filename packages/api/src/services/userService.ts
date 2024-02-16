import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  AppClient as FarcasterAuthClient,
  createAppClient,
  viemConnector,
} from "@farcaster/auth-client";
import {
  AuthFarcasterRequest,
  AuthResponse,
  ErrorResponse,
  TokenResponse,
} from "../../types";
import { Entity } from "@flink/common/types";
import { PrismaClient } from "@flink/common/prisma/nook";
import { ObjectId } from "mongodb";
import { Nook } from "../../data";

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

  async authFarcaster(
    request: AuthFarcasterRequest,
  ): Promise<AuthResponse | ErrorResponse> {
    const verifyResult = await this.farcasterAuthClient.verifySignInMessage({
      domain: process.env.SIWF_DOMAIN || "localhost:3000",
      ...request,
    });

    if (verifyResult.isError) {
      return {
        status: 401,
        message: verifyResult.error?.message || "Sign in failed",
      };
    }

    const collection = this.client.getCollection<Entity>(
      MongoCollection.Entity,
    );
    const entity = await collection.findOne({
      "farcaster.fid": verifyResult.fid.toString(),
    });

    if (!entity) {
      return {
        status: 401,
        message: "FID not found",
      };
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
      user,
      entity,
      token,
      refreshToken: user.refreshToken,
      expiresAt,
    };
  }

  async getToken(refreshToken: string): Promise<TokenResponse | ErrorResponse> {
    const decoded = this.jwt.verify(refreshToken) as { id: string };
    const user = await this.nookClient.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return {
        status: 404,
        message: "User not found",
      };
    }

    if (user.refreshToken !== refreshToken) {
      return {
        status: 401,
        message: "Invalid refresh token",
      };
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

  async getNooks(userId: string): Promise<Nook[]> {
    const nookIds = await this.nookClient.nookMembership.findMany({
      where: {
        userId,
      },
    });

    return await this.client
      .getCollection<Nook>(MongoCollection.Nooks)
      .find({
        _id: {
          $in: nookIds.map((nook) => new ObjectId(nook.nookId)),
        },
      })
      .toArray();
  }
}
