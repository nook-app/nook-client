import { FastifyInstance } from "fastify";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
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
import { Entity, Nook } from "@nook/common/types";
import { PrismaClient } from "@nook/common/prisma/nook";
import { ObjectId } from "mongodb";
import { getOrCreateEntityNook } from "../utils/nooks";
import { getOrCreateEntitiesForFids } from "@nook/common/entity";

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

    const fid = verifyResult.fid.toString();
    let entity = await collection.findOne({
      "farcaster.fid": fid,
    });

    if (!entity) {
      entity = (await getOrCreateEntitiesForFids(this.client, [fid]))[fid];
    }

    if (!entity) {
      return;
    }

    const refreshToken = this.jwt.sign({
      id: entity._id.toString(),
    });

    let user = await this.nookClient.user.findUnique({
      where: {
        id: entity._id.toString(),
      },
    });

    if (!user) {
      user = await this.nookClient.user.create({
        data: {
          id: entity._id.toString(),
          signedUpAt: new Date(),
          loggedInAt: new Date(),
          signerEnabled: false,
          refreshToken,
        },
      });

      const defaultNook = await getOrCreateEntityNook(this.client, entity);
      await this.nookClient.nookMembership.createMany({
        skipDuplicates: true,
        data: [
          {
            nookId: defaultNook._id.toString(),
            userId: user.id,
          },
          {
            nookId: "65cec2e40c6be21bbe973650",
            userId: user.id,
          },
        ],
      });
    }

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

    const entity = await this.client.findEntity(user.id);
    if (!entity) {
      return;
    }

    let nooks = await this.client
      .getCollection<Nook>(MongoCollection.Nooks)
      .find({
        _id: {
          $in: user.nookMemberships.map((nook) => new ObjectId(nook.nookId)),
        },
      })
      .toArray();

    if (
      !nooks.some(({ nookId }) => nookId === `entity:${entity._id.toString()}`)
    ) {
      const defaultNook = await getOrCreateEntityNook(this.client, entity);
      await this.nookClient.nookMembership.create({
        data: {
          nookId: defaultNook._id.toString(),
          userId: user.id,
        },
      });
      nooks = [defaultNook, ...nooks];
    }

    return {
      user,
      entity,
      nooks,
    };
  }
}
