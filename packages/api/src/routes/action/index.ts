import { FastifyInstance } from "fastify";
import { ActionService } from "../../services/actionService";

export const actionRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const actionService = new ActionService(fastify);

    fastify.get("/farcaster/signer", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      try {
        const data = await actionService.getSigner(id);
        return reply.send(data);
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get<{ Querystring: { token: string } }>(
      "/farcaster/signer/validate",
      async (request, reply) => {
        await request.jwtVerify();
        try {
          const data = await actionService.validateSigner(request.query.token);
          return reply.send(data);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: { message: string; channel?: string } }>(
      "/farcaster/casts",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await actionService.createCast(
            id,
            request.body.message,
            request.body.channel,
          );
          return reply.send({ hash });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await actionService.deleteCast(id, request.params.hash);
          return reply.send({ hash });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash/likes",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await actionService.createReaction(
            id,
            request.params.hash,
            1,
          );
          return reply.send({ hash });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash/likes",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await actionService.deleteReaction(
            id,
            request.params.hash,
            1,
          );
          return reply.send({ hash });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash/recasts",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await actionService.createReaction(
            id,
            request.params.hash,
            2,
          );
          return reply.send({ hash });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash/recasts",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const hash = await actionService.deleteReaction(
            id,
            request.params.hash,
            2,
          );
          return reply.send({ hash });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Params: { fid: string } }>(
      "/farcaster/users/:fid/followers",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const fid = await actionService.createLink(
            id,
            request.params.fid,
            "follow",
          );
          return reply.send({ fid });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Params: { fid: string } }>(
      "/farcaster/users/:fid/followers",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        try {
          const fid = await actionService.deleteLink(
            id,
            request.params.fid,
            "follow",
          );
          return reply.send({ fid });
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
