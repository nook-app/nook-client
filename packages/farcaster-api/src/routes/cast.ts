import {
  GetFarcasterCastRepliesRequest,
  GetFarcasterCastRequest,
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByFollowingRequest,
  GetFarcasterCastsByChannelRequest,
  GetFarcasterCastsRequest,
  GetFarcasterCastByContentTypeRequest,
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
      Params: GetFarcasterCastRepliesRequest;
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
      Params: GetFarcasterCastRepliesRequest;
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
      Params: GetFarcasterCastRepliesRequest;
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
      const response = await service.getCastsByFollowing(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.post<{
      Body: GetFarcasterCastsByFidsRequest;
    }>("/casts/by-fids", async (request, reply) => {
      const response = await service.getCastsByFids(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.post<{
      Body: GetFarcasterCastsByChannelRequest;
    }>("/casts/by-channel", async (request, reply) => {
      const response = await service.getCastsByChannel(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });

    fastify.post<{
      Body: GetFarcasterCastByContentTypeRequest;
    }>("/casts/by-content-type", async (request, reply) => {
      const response = await service.getCastsByContentType(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(response);
    });
  });
};
