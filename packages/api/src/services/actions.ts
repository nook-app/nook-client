import { CastAction, Prisma, PrismaClient } from "@nook/common/prisma/nook";
import { CastActionRequest } from "@nook/common/types";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

const MAX_PAGE_SIZE = 25;

export class ActionsService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
  }

  async searchActions(query?: string, cursor?: string) {
    const conditions: string[] = [`NOT "hidden"`];
    if (query) {
      conditions.push(`"name" ILIKE '%${query}%'`);
    }

    const decodedCursor = decodeCursor(cursor);
    if (decodedCursor) {
      conditions.push(
        `("Nook".users < ${decodedCursor.users} OR ("Nook".users = ${
          decodedCursor.users
        } AND "Nook"."createdAt" < '${new Date(
          decodedCursor.createdAt,
        ).toISOString()}'))`,
      );
    }

    const whereClause = conditions.join(" AND ");

    const data = await this.client.$queryRaw<
      (CastAction & { users: number })[]
    >(
      Prisma.sql([
        `
      WITH RankedActions AS (
        SELECT "CastAction".*, COUNT(*) AS users,
          ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT "UserCastAction"."fid") DESC, "CastAction"."createdAt" DESC) AS rn
        FROM "CastAction"
        LEFT JOIN "UserCastAction" ON "CastAction"."id" = "UserCastAction"."actionId"
        GROUP BY "CastAction".id
      )
      SELECT *
      FROM RankedActions
      WHERE ${whereClause}
      ORDER BY users DESC, "createdAt" DESC
      LIMIT ${MAX_PAGE_SIZE}
    `,
      ]),
    );

    return {
      data,
      nextCursor:
        data.length === MAX_PAGE_SIZE
          ? encodeCursor({
              users: data[data.length - 1].users,
              createdAt: data[data.length - 1].createdAt.getTime(),
            })
          : null,
    };
  }

  async getUserActions(fid: string) {
    return await this.client.userCastAction.findMany({
      where: {
        fid,
      },
      include: {
        action: true,
      },
      orderBy: {
        index: "asc",
      },
    });
  }

  async addUserAction(
    fid: string,
    index: number,
    request: CastActionRequest | null,
  ) {
    if (request === null) {
      await this.client.userCastAction.delete({
        where: {
          fid_index: {
            fid,
            index,
          },
        },
      });
      return;
    }

    let action = await this.client.castAction.findUnique({
      where: {
        actionType_postUrl: request,
      },
    });

    if (!action) {
      action = await this.client.castAction.create({
        data: request,
      });
    }

    await this.client.userCastAction.upsert({
      where: {
        fid_index: {
          fid,
          index,
        },
      },
      update: {
        actionId: action.id,
      },
      create: {
        fid,
        index,
        actionId: action.id,
      },
    });
  }
}
