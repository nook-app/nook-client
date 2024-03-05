import { FastifyInstance } from "fastify";
import { FarcasterService } from "../../services/farcasterService";
import { FarcasterFeedRequest } from "../../../types";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterService = new FarcasterService(fastify);

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash",
      async (request, reply) => {
        let viewerFid: string | undefined;
        if (request.headers.authorization) {
          const decoded = (await request.jwtDecode()) as { fid: string };
          viewerFid = decoded.fid;
        }
        try {
          const data = await farcasterService.getCast(
            request.params.hash,
            viewerFid,
          );
          return reply.send(data);
        } catch (e) {
          console.error("/farcaster/cast/:hash", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash/replies",
      async (request, reply) => {
        let viewerFid: string | undefined;
        if (request.headers.authorization) {
          const decoded = (await request.jwtDecode()) as { fid: string };
          viewerFid = decoded.fid;
        }
        try {
          const data = await farcasterService.getCastReplies(
            request.params.hash,
            viewerFid,
          );
          return reply.send({ data });
        } catch (e) {
          console.error("/farcaster/cast/:hash", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: FarcasterFeedRequest }>(
      "/farcaster/feed",
      async (request, reply) => {
        let viewerFid: string | undefined;
        if (request.headers.authorization) {
          const decoded = (await request.jwtDecode()) as { fid: string };
          viewerFid = decoded.fid;
        }
        try {
          const data = await farcasterService.getFeed(
            request.body.feedId,
            request.body.cursor,
            viewerFid,
          );
          return reply.send(data);
        } catch (e) {
          console.error("/farcaster/feed", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
