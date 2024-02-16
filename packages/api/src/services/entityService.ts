import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  AppClient as FarcasterAuthClient,
  createAppClient,
  viemConnector,
} from "@farcaster/auth-client";
import { AuthFarcasterRequest, AuthResponse, ErrorResponse } from "../../types";
import { randomUUID } from "crypto";
import { Entity } from "@flink/common/types";
import { Nook } from "../../data";
import { PrismaClient } from "@flink/common/prisma/nook";

export class EntityService {
  private client: MongoClient;
  private farcasterAuthClient: FarcasterAuthClient;
  private nookClient: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
    this.nookClient = fastify.nook.client;
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

    const token = randomUUID();

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

    const user = await this.nookClient.user.upsert({
      include: {
        nookMemberships: true,
      },
      where: {
        fid: verifyResult.fid.toString(),
      },
      update: {
        token,
        loggedInAt: new Date(),
      },
      create: {
        id: entity._id.toString(),
        fid: verifyResult.fid.toString(),
        token,
        signedUpAt: new Date(),
        loggedInAt: new Date(),
        signerEnabled: false,
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

    const nooks = await this.client
      .getCollection<Nook>(MongoCollection.Nooks)
      .find({
        id: { $in: user.nookMemberships.map((m) => m.nookId) },
      })
      .toArray();

    return {
      token,
      entity,
      nooks,
    };
  }
}
