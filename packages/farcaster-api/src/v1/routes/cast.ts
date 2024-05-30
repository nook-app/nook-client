import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";
import {
  FarcasterFeedRequest,
  GetFarcasterCastsRequest,
} from "@nook/common/types";

export const castRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Params: {
        hash: string;
      };
    }>("/casts/:hash", async (request, reply) => {
      const cast = await service.getCast(
        request.params.hash,
        request.headers["x-viewer-fid"] as string,
      );

      if (!cast) {
        reply.status(404).send({ message: "Cast not found" });
        return;
      }

      reply.send(cast);
    });

    fastify.post<{
      Body: FarcasterFeedRequest;
    }>("/casts", async (request, reply) => {
      const casts = await service.getCasts(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(casts);
    });

    fastify.get<{
      Params: { hash: string };
      Querystring: { cursor?: string };
    }>("/casts/:hash/replies", async (request, reply) => {
      const response = await service.getCastReplies(
        request.params.hash,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.get<{
      Params: { hash: string };
      Querystring: { cursor?: string };
    }>("/casts/:hash/replies/new", async (request, reply) => {
      const response = await service.getNewCastReplies(
        request.params.hash,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );
      return reply.send(response);
    });

    fastify.get<{
      Params: { hash: string };
      Querystring: { cursor?: string };
    }>("/casts/:hash/replies/top", async (request, reply) => {
      const response = await service.getTopCastReplies(
        request.params.hash,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );
      return reply.send(response);
    });

    fastify.get<{
      Params: { hash: string };
      Querystring: { cursor?: string };
    }>("/casts/:hash/quotes", async (request, reply) => {
      const response = await service.getCastQuotes(
        request.params.hash,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.get<{
      Params: { hash: string };
      Querystring: { cursor?: string };
    }>("/casts/:hash/likes", async (request, reply) => {
      const response = await service.getCastLikes(
        request.params.hash,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.get<{
      Params: { hash: string };
      Querystring: { cursor?: string };
    }>("/casts/:hash/recasts", async (request, reply) => {
      const response = await service.getCastRecasts(
        request.params.hash,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.post<{
      Body: GetFarcasterCastsRequest;
    }>("/casts/hashes", async (request, reply) => {
      const casts = await service.getCastsForHashes(
        request.body.hashes,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send({ data: request.body.hashes.map((hash) => casts[hash]) });
    });
  });
};
