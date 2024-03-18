import { FastifyInstance } from "fastify";
import { CreateListRequest } from "@nook/common/types";
import { ListService } from "../../services/lists";

export const listRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const listService = new ListService(fastify);

    fastify.get<{ Querystring: { fid: string } }>(
      "/lists/users",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const data = await listService.getUserLists(request.query.fid, fid);
          return reply.send({ data });
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.get<{ Querystring: { fid: string } }>(
      "/lists/channels",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const data = await listService.getChannelLists(
            request.query.fid,
            fid,
          );
          return reply.send({ data });
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.put<{ Body: CreateListRequest }>(
      "/lists",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const data = await listService.createList(fid, request.body);
          return reply.send(data);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.get<{ Params: { listId: string } }>(
      "/lists/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.type === "USER") {
            const data = await listService.formatUserLists([list]);
            return reply.send(data[0]);
          }
          if (list.type === "CHANNEL") {
            const data = await listService.formatChannelLists([list]);
            return reply.send(data[0]);
          }
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.patch<{ Params: { listId: string }; Body: CreateListRequest }>(
      "/lists/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await listService.updateList(request.params.listId, request.body);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { listId: string } }>(
      "/lists/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await listService.deleteList(request.params.listId);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.put<{ Params: { listId: string }; Body: { id: string } }>(
      "/lists/:listId/add",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          const data = await listService.addToList(
            request.params.listId,
            request.body.id,
          );
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { listId: string }; Body: { id: string } }>(
      "/lists/:listId/remove",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorFid !== fid) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await listService.removeFromList(
            request.params.listId,
            request.body.id,
          );
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );
  });
};
