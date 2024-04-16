import { FastifyInstance } from "fastify";
import { PanelRequest } from "@nook/common/types/feed";
import { PanelService } from "../../services/panel";
import { CreateNookRequest } from "@nook/common/types";
import { GroupService } from "../../services/group";

export const panelRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new PanelService(fastify);
    const groupService = new GroupService(fastify);

    fastify.put<{ Body: CreateNookRequest }>(
      "/groups",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };

        try {
          const response = await groupService.createGroup(fid, request.body);
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.status(500).send({ error: "Internal Server Error" });
        }
      },
    );

    fastify.patch<{ Params: { groupId: string }; Body: CreateNookRequest }>(
      "/groups/:groupId",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const group = await groupService.getGroup(request.params.groupId);
          if (!group) {
            return reply.status(404).send({ error: "Group not found" });
          }
          if (group.fid !== fid) {
            return reply.status(401).send({ error: "Unauthorized" });
          }
          const response = await groupService.updateGroup(
            fid,
            request.params.groupId,
            request.body,
          );
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.status(500).send({ error: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { groupId: string } }>(
      "/groups/:groupId",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const group = await groupService.getGroup(request.params.groupId);
          if (!group) {
            return reply.status(404).send({ error: "Group not found" });
          }
          if (group.fid !== fid) {
            return reply.status(401).send({ error: "Unauthorized" });
          }
          const response = await groupService.deleteGroup(
            request.params.groupId,
          );
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.status(500).send({ error: "Internal Server Error" });
        }
      },
    );

    fastify.post<{ Body: PanelRequest }>("/panels", async (request, reply) => {
      await request.jwtVerify();

      try {
        const response = await service.getPanel(request.body);

        if ("status" in response) {
          return reply.status(response.status || 500).send(response);
        }

        return reply.send(response);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    });
  });
};
