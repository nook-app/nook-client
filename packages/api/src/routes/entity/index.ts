import { FastifyInstance } from "fastify";
import { authFarcaster } from "../entity/authFarcaster";

export const entityRoutes = async (fastify: FastifyInstance) => {
  fastify.register(authFarcaster);
};
