import {
  GetFarcasterCastRepliesRequest,
  GetFarcasterCastRequest,
  GetFarcasterCastsByFidsRequest,
  GetFarcasterCastsByFollowingRequest,
  GetFarcasterCastsByParentUrlRequest,
  GetFarcasterCastsRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { CastService } from "../../service/cast";

export const castRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const castService = new CastService(
      fastify.farcaster.client,
      fastify.redis.client,
    );

    fastify.get<{ Params: GetFarcasterCastRequest }>(
      "/casts/:hash",
      async (request, reply) => {
        const cast = await castService.getCast(request.params.hash);

        if (!cast) {
          reply.status(404).send({ message: "Cast not found" });
          return;
        }

        reply.send(cast);
      },
    );

    fastify.get<{ Params: GetFarcasterCastRepliesRequest }>(
      "/casts/:hash/replies",
      async (request, reply) => {
        const casts = await castService.getCastReplies(request.params.hash);
        reply.send({ data: casts });
      },
    );

    fastify.post<{ Body: GetFarcasterCastsRequest }>(
      "/casts",
      async (request, reply) => {
        const casts = await castService.getCasts(request.body.hashes);
        reply.send({ data: casts });
      },
    );

    fastify.post<{ Body: GetFarcasterCastsByFollowingRequest }>(
      "/casts/by-following",
      async (request, reply) => {
        const casts = await castService.getCastsByFollowing(request.body);
        reply.send({ data: casts });
      },
    );

    fastify.post<{ Body: GetFarcasterCastsByFidsRequest }>(
      "/casts/by-fids",
      async (request, reply) => {
        const casts = await castService.getCastsByFids(request.body);
        reply.send({ data: casts });
      },
    );

    fastify.post<{ Body: GetFarcasterCastsByParentUrlRequest }>(
      "/casts/by-parent-url",
      async (request, reply) => {
        const casts = await castService.getCastsByParentUrl(request.body);
        reply.send({ data: casts });
      },
    );
  });
};
