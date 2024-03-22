import { FastifyInstance } from "fastify";
import {
  CreateUserListRequest,
  CreateChannelListRequest,
} from "@nook/common/types";
import { ListsService } from "../service/lists";

export const listRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const listService = new ListsService(fastify);

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

    fastify.put<{ Body: CreateUserListRequest }>(
      "/lists/users",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const data = await listService.createUserList(fid, request.body);
          return reply.send(data);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.put<{ Body: CreateChannelListRequest }>(
      "/lists/channels",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const data = await listService.createChannelList(fid, request.body);
          return reply.send(data);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.get<{ Params: { listId: string } }>(
      "/lists/users/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getUserList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          const data = await listService.formatUserLists([list]);
          return reply.send(data[0]);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.get<{ Params: { listId: string } }>(
      "/lists/channels/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getChannelList(request.params.listId);
          if (
            !list ||
            list.deletedAt ||
            (list.visibility === "PRIVATE" && list.creatorFid !== fid)
          ) {
            return reply.code(404).send({ message: "List not found" });
          }
          const data = await listService.formatChannelLists([list]);
          return reply.send(data[0]);
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.patch<{ Params: { listId: string }; Body: CreateUserListRequest }>(
      "/lists/users/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getUserList(request.params.listId);
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
          await listService.updateUserList(request.params.listId, request.body);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.patch<{
      Params: { listId: string };
      Body: CreateChannelListRequest;
    }>("/lists/channels/:listId", async (request, reply) => {
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const list = await listService.getChannelList(request.params.listId);
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
        await listService.updateChannelList(
          request.params.listId,
          request.body,
        );
        return reply.send({});
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: "Internal Server Error" });
      }
    });

    fastify.delete<{ Params: { listId: string } }>(
      "/lists/users/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getUserList(request.params.listId);
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
          await listService.deleteUserList(request.params.listId);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { listId: string } }>(
      "/lists/channels/:listId",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getChannelList(request.params.listId);
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
          await listService.deleteChannelList(request.params.listId);
          return reply.send({});
        } catch (error) {
          console.error(error);
          return reply.code(500).send({ message: "Internal Server Error" });
        }
      },
    );

    fastify.put<{ Params: { listId: string }; Body: { id: string } }>(
      "/lists/users/:listId/add",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getUserList(request.params.listId);
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
          const data = await listService.addToUserList(
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

    fastify.put<{ Params: { listId: string }; Body: { id: string } }>(
      "/lists/channels/:listId/add",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getChannelList(request.params.listId);
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
          await listService.addToChannelList(
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
      "/lists/users/:listId/remove",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getUserList(request.params.listId);
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
          await listService.removeFromUserList(
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
      "/lists/channels/:listId/remove",
      async (request, reply) => {
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          const list = await listService.getChannelList(request.params.listId);
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
          await listService.removeFromChannelList(
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
