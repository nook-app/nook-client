import { PrismaClient } from "@nook/common/prisma/nook";
import { PendingCastRequest, PendingCastResponse } from "@nook/common/types";
import { decodeCursor, encodeCursor } from "@nook/common/utils";
import { createHash, randomUUID } from "crypto";
import { FastifyInstance } from "fastify";

const MAX_PAGE_SIZE = 25;

export class PendingCastService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
  }

  async getDraftCasts(
    fid: string,
    cursor?: string,
  ): Promise<PendingCastResponse> {
    return this._getPendingCasts(fid, cursor, true);
  }

  async getScheduledCasts(fid: string, cursor?: string) {
    return this._getPendingCasts(fid, cursor, false);
  }

  async _getPendingCasts(
    fid: string,
    cursor: string | undefined,
    drafts: boolean,
  ) {
    const cursorObj = decodeCursor(cursor) as unknown as
      | { createdAt: number }
      | undefined;
    const data = await this.client.pendingCast.findMany({
      where: {
        fid,
        scheduledFor: drafts ? null : { not: null },
        createdAt: {
          lt: cursorObj ? new Date(cursorObj.createdAt) : undefined,
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
    const scheduledFor = this._validateScheduledFor(pendingCast.scheduledFor);
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
        scheduledFor: scheduledFor,
        textHash: createHash("md5").update(pendingCast.text).digest("hex"),
      },
    });
  }

  async updatePendingCast(pendingCast: PendingCastRequest) {
    const scheduledFor = this._validateScheduledFor(pendingCast.scheduledFor);
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
        scheduledFor: scheduledFor,
      },
    });
  }

  async deletePendingCast(fid: string, pendingCastId: string) {
    return this.client.pendingCast.delete({
      where: { id: pendingCastId, fid },
    });
  }

  async upsertThread(fid: string, pendingCast: PendingCastRequest[]) {
    const parent = pendingCast[0];
    const children = pendingCast.slice(1);
    const parentId = parent.id || randomUUID();
    const scheduledFor = this._validateScheduledFor(parent.scheduledFor);

    const threadParent = await this.client.pendingCast.upsert({
      where: { id: parentId, fid },
      update: {
        ...parent,
        threadParent: undefined,
        textHash: createHash("md5").update(parent.text).digest("hex"),
        threadParentId: null,
        threadIndex: 0,
        scheduledFor: scheduledFor,
        threadChildren: {
          deleteMany: {
            threadParentId: parentId,
            threadIndex: { gt: children.length },
          },
          upsert: children
            ? children.map((child, i) => ({
                where: {
                  id: child.id,
                  fid,
                },
                create: {
                  ...child,
                  fid: fid,
                  textHash: createHash("md5").update(child.text).digest("hex"),
                  threadParentId: parentId,
                  threadIndex: i + 1,
                  scheduledFor: scheduledFor,
                },
                update: {
                  ...child,
                  textHash: createHash("md5").update(child.text).digest("hex"),
                  threadParentId: parentId,
                  threadIndex: i + 1,
                  scheduledFor: scheduledFor,
                },
              }))
            : [],
        },
      },
      create: {
        ...parent,
        id: parentId,
        fid,
        textHash: createHash("md5").update(parent.text).digest("hex"),
        threadIndex: 0,
        threadParent: undefined,
        threadParentId: null,
        scheduledFor: scheduledFor,
        threadChildren: {
          create: children
            ? children.map((child) => ({
                ...child,
                fid: fid,
                threadParentId: parentId,
                textHash: createHash("md5").update(child.text).digest("hex"),
                scheduledFor: scheduledFor,
              }))
            : [],
        },
      },
      include: {
        threadChildren: true,
      },
    });
    return [threadParent, ...threadParent.threadChildren];
  }

  _validateScheduledFor(scheduledFor: string | null) {
    const date = scheduledFor ? new Date(scheduledFor) : null;
    if (date !== null && date.getTime() < Date.now()) {
      throw new Error("Scheduled for date is in the past");
    }
    return date;
  }
}
