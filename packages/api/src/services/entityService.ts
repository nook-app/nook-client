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
import { TEMPLATE_NOOKS } from "../../data";

export class EntityService {
  private client: MongoClient;
  private farcasterAuthClient: FarcasterAuthClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.mongo.client;
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

    return {
      token,
      entity,
      nooks: TEMPLATE_NOOKS,
    };
  }
}
