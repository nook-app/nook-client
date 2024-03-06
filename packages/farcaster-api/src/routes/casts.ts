import {
  GetFarcasterCastRepliesRequest,
  GetFarcasterCastRequest,
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByFollowingRequest,
  GetFarcasterCastsByParentUrlRequest,
  GetFarcasterCastsRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const castRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Params: GetFarcasterCastRequest;
    }>("/casts/:hash", async (request, reply) => {
      const cast = await service.getCast(
        request.params.hash,
        undefined,
        request.headers["x-viewer-fid"] as string,
      );

      if (!cast) {
        reply.status(404).send({ message: "Cast not found" });
        return;
      }

      reply.send(cast);
    });

    fastify.get<{
      Params: GetFarcasterCastRepliesRequest;
    }>("/casts/:hash/replies", async (request, reply) => {
      const casts = await service.getCastReplies(
        request.params.hash,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send({ data: casts });
    });

    fastify.post<{
      Body: GetFarcasterCastsRequest;
    }>("/casts", async (request, reply) => {
      const casts = await service.getCasts(
        request.body.hashes,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send({ data: casts });
    });

    fastify.post<{
      Body: GetFarcasterCastsByFollowingRequest;
    }>("/casts/by-following", async (request, reply) => {
      const casts = await service.getCastsByFollowing(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send({ data: casts });
    });

    fastify.post<{
      Body: GetFarcasterCastsByFidsRequest;
    }>("/casts/by-fids", async (request, reply) => {
      const casts = await service.getCastsByFids(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send({ data: casts });
    });

    fastify.post<{
      Body: GetFarcasterCastsByParentUrlRequest;
    }>("/casts/by-parent-url", async (request, reply) => {
      const casts = await service.getCastsByParentUrl(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send({ data: casts });
    });
  });
};
