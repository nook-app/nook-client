import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nook";
import {
  CreateNook,
  CreateShelfInstance,
  Nook,
  NookShelfInstance,
} from "@nook/common/types";
import { ShelfService } from "../../services/shelf";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);
    const shelfService = new ShelfService(fastify);

    fastify.get("/nooks", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const data = await nookService.getNooks(fid);
      return reply.send({ data });
    });

    fastify.get<{ Params: { nookId: string } }>(
      "/nooks/:nookId",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const nook = await nookService.getNook(request.params.nookId);
        if (
          !nook ||
          nook.deletedAt ||
          (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
        ) {
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
          if (
            !nook ||
            nook.deletedAt ||
            (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
          ) {
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
          if (
            !nook ||
            nook.deletedAt ||
            (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
          ) {
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

    fastify.put<{ Body: CreateNook }>("/nooks", async (request, reply) => {
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
          if (
            !nook ||
            nook.deletedAt ||
            (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
          ) {
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
          if (
            !nook ||
            nook.deletedAt ||
            (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
          ) {
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

    fastify.put<{ Params: { nookId: string }; Body: CreateShelfInstance }>(
      "/nooks/:nookId/shelves",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const nook = await nookService.getNook(request.params.nookId);
          if (
            !nook ||
            nook.deletedAt ||
            (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "Nook not found" });
          }
          if (nook.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          const response = await nookService.addShelf(nook, {
            ...request.body,
            creatorFid: fid,
          });
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{
      Params: { nookId: string; shelfId: string };
    }>("/nooks/:nookId/shelves/:shelfId", async (request, reply) => {
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const nook = await nookService.getNook(request.params.nookId);
        if (
          !nook ||
          nook.deletedAt ||
          (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
        ) {
          return reply.code(404).send({ message: "Nook not found" });
        }
        if (nook.creatorFid !== fid) {
          return reply.code(403).send({ message: "Forbidden" });
        }
        await nookService.removeShelf(nook, request.params.shelfId);
        return reply.send({});
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Internal Server Error" });
      }
    });

    fastify.patch<{
      Params: { nookId: string; shelfId: string };
      Body: NookShelfInstance;
    }>("/nooks/:nookId/shelves/:shelfId", async (request, reply) => {
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const nook = await nookService.getNook(request.params.nookId);
        if (
          !nook ||
          nook.deletedAt ||
          (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
        ) {
          return reply.code(404).send({ message: "Nook not found" });
        }
        if (nook.creatorFid !== fid) {
          return reply.code(403).send({ message: "Forbidden" });
        }
        await nookService.updateShelf(request.params.shelfId, request.body);
        return reply.send({});
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Internal Server Error" });
      }
    });

    fastify.post<{
      Params: { nookId: string; instanceId: string };
      Body: { cursor?: string };
    }>("/nooks/:nookId/shelves/:instanceId/data", async (request, reply) => {
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const nook = await nookService.getNook(request.params.nookId);
        if (
          !nook ||
          nook.deletedAt ||
          (nook.visibility === "PRIVATE" && nook.creatorFid !== fid)
        ) {
          return reply.code(404).send({ message: "Nook not found" });
        }
        const shelfInstance = await nookService.getShelfInstance(
          request.params.instanceId,
        );
        if (!shelfInstance) {
          return reply.code(404).send({ message: "Shelf instance not found" });
        }
        const shelf = await nookService.getShelf(shelfInstance.shelfId);
        if (!shelf) {
          return reply.code(404).send({ message: "Shelf not found" });
        }
        const data = await shelfService.getData(
          shelf,
          shelfInstance,
          fid,
          request.body?.cursor,
        );
        return reply.send(data);
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Internal Server Error" });
      }
    });

    fastify.get("/shelves", async (request, reply) => {
      const data = await nookService.getShelfOptions();
      return reply.send({ data });
    });

    fastify.get("/nooks/templates", async (request, reply) => {
      const data = await nookService.getNookTemplates();
      return reply.send({ data });
    });
  });
};
