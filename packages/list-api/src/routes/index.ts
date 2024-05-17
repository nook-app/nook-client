import { FastifyInstance } from "fastify";
import {
  CreateListRequest,
  UpdateListRequest,
  ListItem,
  GetListsRequest,
} from "@nook/common/types";
import { ListsService } from "../service/lists";

export const listsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const listService = new ListsService(fastify);

    fastify.post<{ Body: GetListsRequest }>(
      "/lists/created",
      async (request, reply) => {
        let viewerId: string | undefined;
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          viewerId = id;
        } catch (error) {}

        try {
          const data = await listService.getCreatedLists(
            request.body,
            viewerId,
          );
          return reply.send({ data });
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.post<{ Body: GetListsRequest }>(
      "/lists/followed",
      async (request, reply) => {
        let viewerId: string | undefined;
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          viewerId = id;
        } catch (error) {}

        try {
          const data = await listService.getFollowedLists(
            request.body,
            viewerId,
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
          const { id } = (await request.jwtDecode()) as { id: string };
          const data = await listService.createList(id, request.body);
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
        let viewerId: string | undefined;
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          viewerId = id;
        } catch (error) {}

        try {
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" &&
              (!viewerId || list.creatorId !== BigInt(viewerId)))
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          return reply.send(list);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.patch<{ Params: { listId: string }; Body: UpdateListRequest }>(
      "/lists/:listId",
      async (request, reply) => {
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorId !== BigInt(id))
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorId !== BigInt(id)) {
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
          const { id } = (await request.jwtDecode()) as { id: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorId !== BigInt(id))
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorId !== BigInt(id)) {
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

    fastify.put<{ Params: { listId: string }; Body: ListItem }>(
      "/lists/:listId/items",
      async (request, reply) => {
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorId !== BigInt(id))
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorId !== BigInt(id)) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await listService.addItem(request.body);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { listId: string }; Body: ListItem }>(
      "/lists/:listId/items",
      async (request, reply) => {
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          const list = await listService.getList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorId !== BigInt(id))
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          if (list.creatorId !== BigInt(id)) {
            return reply.code(403).send({ message: "Forbidden" });
          }
          await listService.removeItem(request.body);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.put<{ Params: { listId: string } }>(
      "/lists/:listId/follow",
      async (request, reply) => {
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          await listService.followList(id, request.params.listId);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { listId: string } }>(
      "/lists/:listId/follow",
      async (request, reply) => {
        try {
          const { id } = (await request.jwtDecode()) as { id: string };
          await listService.unfollowList(id, request.params.listId);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );
  });
};
