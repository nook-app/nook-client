import { PrismaClient } from "@nook/common/prisma/nook";
import { PendingCastRequest, PendingCastResponse } from "@nook/common/types";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { FastifyInstance } from "fastify";

const MAX_PAGE_SIZE = 25;

export class PendingCastService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
  }

  async getDraftCasts(
    fid: string,
    cursor: string,
  ): Promise<PendingCastResponse> {
    return this._getPendingCasts(fid, cursor, true);
  }

  async getScheduledCasts(fid: string, cursor: string) {
    return this._getPendingCasts(fid, cursor, false);
  }

  async _getPendingCasts(fid: string, cursor: string, drafts: boolean) {
    const cursorObj = decodeCursor(cursor) as unknown as { createdAt: number };
    const data = await this.client.pendingCast.findMany({
      where: {
        fid,
        scheduledFor: drafts ? null : { not: null },
        createdAt: {
          lt: cursorObj.createdAt ? new Date(cursorObj.createdAt) : undefined,
        },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      data,
      nextCursor:
        data.length === MAX_PAGE_SIZE
          ? encodeCursor({
              createdAt: data[data.length - 1].createdAt.getTime(),
            })
          : undefined,
    };
  }

  async addPendingCast(fid: string, pendingCast: PendingCastRequest) {
    this._validateScheduledFor(pendingCast.scheduledFor);
    return this.client.pendingCast.create({
      data: {
        fid,
        text: pendingCast.text,
        parentUrl: pendingCast.parentUrl,
        parentFid: pendingCast.parentFid,
        parentHash: pendingCast.parentHash,
        castEmbedFid: pendingCast.castEmbedFid,
        castEmbedHash: pendingCast.castEmbedHash,
        embeds: pendingCast.embeds,
        scheduledFor: pendingCast.scheduledFor,
      },
    });
  }

  async updatePendingCast(pendingCast: PendingCastRequest) {
    this._validateScheduledFor(pendingCast.scheduledFor);
    // todo: will this fail if not exists?
    return this.client.pendingCast.update({
      where: { id: pendingCast.id },
      data: {
        text: pendingCast.text,
        parentUrl: pendingCast.parentUrl,
        parentFid: pendingCast.parentFid,
        parentHash: pendingCast.parentHash,
        castEmbedFid: pendingCast.castEmbedFid,
        castEmbedHash: pendingCast.castEmbedHash,
        embeds: pendingCast.embeds,
        scheduledFor: pendingCast.scheduledFor,
      },
    });
  }

  async deletePendingCast(fid: string, pendingCastId: string) {
    return this.client.pendingCast.delete({
      where: { id: pendingCastId, fid },
    });
  }

  _validateScheduledFor(scheduledFor: Date | null) {
    if (scheduledFor && scheduledFor.getTime() < Date.now()) {
      throw new Error("Scheduled for date is in the past");
    }
  }
}
