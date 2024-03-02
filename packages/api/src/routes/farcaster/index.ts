import { FastifyInstance } from "fastify";
import { FarcasterService } from "../../services/farcasterService";
import { FarcasterFeedRequest } from "../../../types";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterService = new FarcasterService(fastify);

    fastify.get("/farcaster/signer", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      try {
        const data = await farcasterService.getSigner(id);
        return reply.send(data);
      } catch (e) {
        console.error("/farcaster/signer", e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get<{ Querystring: { token: string } }>(
      "/farcaster/signer/validate",
      async (request, reply) => {
        await request.jwtVerify();
        try {
          const data = await farcasterService.validateSigner(
            request.query.token,
          );
          return reply.send(data);
        } catch (e) {
          console.error("/farcaster/signer/validate", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: { message: string; channel?: string } }>(
      "/farcaster/casts",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await farcasterService.createCast(
            id,
            request.body.message,
            request.body.channel,
          );
          return reply.send({ hash });
        } catch (e) {
          console.error("/farcaster/post", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash",
      async (request, reply) => {
        try {
          const data = await farcasterService.getCast(request.params.hash);
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
        try {
          const data = await farcasterService.getCastReplies(
            request.params.hash,
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
        try {
          const data = await farcasterService.getFeed(
            request.body.feedId,
            request.body.cursor,
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
