import { GetEntitiesByFidsRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { EntityService } from "../service/entity";

declare module "fastify" {
  interface FastifyRequest {
    service: EntityService;
  }
}

export const entityRoutes = async (fastify: FastifyInstance) => {
  const service = new EntityService(fastify);
  fastify.register(async (fastify: FastifyInstance) => {
    fastify.post<{ Body: GetEntitiesByFidsRequest }>(
      "/entities/by-fid",
      async (request, reply) => {
        const entities = await service.getEntitiesForFids(
          request.body.fids,
          request.headers["x-viewer-fid"] as string,
        );
        reply.send({ data: entities });
      },
    );

    fastify.get<{ Params: { fid: string } }>(
      "/entities/by-fid/:fid",
      async (request, reply) => {
        const entity = await service.getEntityForFid(
          request.params.fid,
          request.headers["x-viewer-fid"] as string,
        );
        reply.send(entity);
      },
    );

    fastify.get<{ Params: { id: string } }>(
      "/entities/:id",
      async (request, reply) => {
        const entity = await service.getEntity(
          request.params.id,
          request.headers["x-viewer-fid"] as string,
        );
        reply.send(entity);
      },
    );
  });
};
