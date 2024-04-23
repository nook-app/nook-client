import { FastifyInstance } from "fastify";
import { PendingCastService } from "../../services/pendingCast";
import { PendingCastRequest, PendingCastResponse } from "@nook/common/types";

export const pendingCastRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new PendingCastService(fastify);

    fastify.get<{
      Querystring: { fid: string; cursor: string };
      Reply: PendingCastResponse | { error: string };
    }>("/drafts", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      if (fid !== request.query.fid) {
        // 403 forbidden
        return reply.status(403).send({ error: "Forbidden" });
      }
      const response = await service.getDraftCasts(fid, request.query.cursor);
      return reply.send(response);
    });

    fastify.get<{
      Querystring: { fid: string; cursor: string };
      Reply: PendingCastResponse | { error: string };
    }>("/scheduled", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      if (fid !== request.query.fid) {
        // send 403 forbidden
        return reply.status(403).send({ error: "Forbidden" });
      }
      const response = await service.getScheduledCasts(
        fid,
        request.query.cursor,
      );
      return reply.send(response);
    });

    fastify.post<{ Body: PendingCastRequest }>(
      "/pending",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const response = await service.addPendingCast(fid, request.body);
        return reply.send(response.id);
      },
    );

    fastify.delete<{ Body: { id: string } }>(
      "/pending",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const response = await service.deletePendingCast(fid, request.body.id);
        if (response === null) {
          return reply.status(404).send({ error: "Pending cast not found" });
        }
        return reply.send(response);
      },
    );
  });
};
