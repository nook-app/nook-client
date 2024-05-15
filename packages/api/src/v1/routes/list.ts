import { FastifyInstance } from "fastify";
import { ListService } from "../services/list";
import {
  CreateListRequest,
  GetListsRequest,
  ListItem,
  UpdateListRequest,
} from "@nook/common/types";
import { ListAPIClient } from "@nook/common/clients";

export const listRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const listApi = new ListAPIClient();
    const listService = new ListService(fastify);

    fastify.put<{ Body: CreateListRequest }>(
      "/lists",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.createList(
          request.headers.authorization,
          request.body,
        );
        return reply.send(data);
      },
    );

    fastify.patch<{ Body: UpdateListRequest; Params: { listId: string } }>(
      "/lists/:listId",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.updateList(
          request.headers.authorization,
          request.params.listId,
          request.body,
        );
        return reply.send(data);
      },
    );

    fastify.delete<{ Params: { listId: string } }>(
      "/lists/:listId",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.removeList(
          request.headers.authorization,
          request.params.listId,
        );
        return reply.send(data);
      },
    );

    fastify.put<{ Params: { listId: string }; Body: ListItem }>(
      "/lists/:listId/items",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.addListItem(
          request.headers.authorization,
          request.params.listId,
          request.body,
        );
        return reply.send(data);
      },
    );

    fastify.delete<{ Params: { listId: string }; Body: ListItem }>(
      "/lists/:listId/items",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.removeListItem(
          request.headers.authorization,
          request.params.listId,
          request.body,
        );
        return reply.send(data);
      },
    );

    fastify.put<{ Params: { listId: string }; Body: ListItem }>(
      "/lists/:listId/follow",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.followList(
          request.headers.authorization,
          request.params.listId,
        );
        return reply.send(data);
      },
    );

    fastify.delete<{ Params: { listId: string }; Body: ListItem }>(
      "/lists/:listId/follow",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        const data = await listApi.unfollowList(
          request.headers.authorization,
          request.params.listId,
        );
        return reply.send(data);
      },
    );

    fastify.post<{ Body: GetListsRequest }>(
      "/lists/created",
      async (request, reply) => {
        const lists = await listApi.getCreatedLists(
          request.headers.authorization || "",
          request.body,
        );
        const userLists = await listService.enrichLists(lists.data);
        return reply.send({ data: userLists });
      },
    );

    fastify.post<{ Body: GetListsRequest }>(
      "/lists/followed",
      async (request, reply) => {
        const lists = await listApi.getFollowedLists(
          request.headers.authorization || "",
          request.body,
        );
        const userLists = await listService.enrichLists(lists.data);
        return reply.send({ data: userLists });
      },
    );

    fastify.get<{ Params: { listId: string } }>(
      "/lists/:listId",
      async (request, reply) => {
        const list = await listApi.getList(
          request.headers.authorization || "",
          request.params.listId,
        );
        const userLists = await listService.enrichLists([list]);
        return reply.send(userLists[0]);
      },
    );
  });
};
