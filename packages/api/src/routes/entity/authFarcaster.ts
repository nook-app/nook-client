import { FastifyInstance } from "fastify";
import { AuthFarcasterRequest } from "../../../types";
import { EntityService } from "../../services/entityService";

export const authFarcaster = async (fastify: FastifyInstance) => {
  const authService = new EntityService(fastify);

  fastify.post<{ Body: AuthFarcasterRequest }>(
    "/auth/farcaster",
    async (request, reply) => {
      const data = await authService.authFarcaster(request.body);
      return reply.send(data);
    },
  );
};
