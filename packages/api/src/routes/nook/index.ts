import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nook";
import { Nook } from "@nook/common/types";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);

    fastify.get("/nooks", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const data = await nookService.getNooks(fid);
      return reply.send({ data });
    });

    fastify.get<{ Params: { nookId: string } }>(
      "/nooks/:nookId",
      async (request, reply) => {
        const nook = await nookService.getNook(request.params.nookId);
        if (!nook || nook.deletedAt) {
          return reply.code(404).send({ message: "Nook not found" });
        }
        return reply.send(nook);
      },
    );

    fastify.put<{ Params: { nookId: string } }>(
      "/nooks/:nookId/members",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const nook = await nookService.getNook(request.params.nookId);
          if (!nook || nook.deletedAt) {
            return reply.code(404).send({ message: "Nook not found" });
          }
          await nookService.joinNook(request.params.nookId, fid);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { nookId: string } }>(
      "/nooks/:nookId/members",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const nook = await nookService.getNook(request.params.nookId);
          if (!nook || nook.deletedAt) {
            return reply.code(404).send({ message: "Nook not found" });
          }
          await nookService.leaveNook(request.params.nookId, fid);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.get<{ Querystring: { query: string; cursor?: string } }>(
      "/nooks/search",
      async (request, reply) => {
        const data = await nookService.searchNooks(
          request.query.query,
          request.query.cursor,
        );
        return reply.send(data);
      },
    );

    fastify.put<{ Body: Nook }>("/nooks", async (request, reply) => {
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const data = await nookService.createNook(fid, request.body);
        return reply.send(data);
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Internal Server Error" });
      }
    });

    fastify.patch<{ Params: { nookId: string }; Body: Nook }>(
      "/nooks/:nookId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const nook = await nookService.getNook(request.params.nookId);
          if (!nook) {
            return reply.code(404).send({ message: "Nook not found" });
          }
          if (nook.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await nookService.updateNook(request.params.nookId, request.body);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { nookId: string } }>(
      "/nooks/:nookId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const nook = await nookService.getNook(request.params.nookId);
          if (!nook) {
            return reply.code(404).send({ message: "Nook not found" });
          }
          if (nook.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await nookService.deleteNook(request.params.nookId);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.post<{
      Body: { feedId: string };
      Querystring: { cursor?: string };
    }>("/feeds/farcaster", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const feed = await nookService.getFarcasterFeed(
        request.body.feedId,
        request.query.cursor,
        fid,
      );
      if (!feed) {
        reply.status(404);
        return;
      }
      return reply.send(feed);
    });
  });
};
