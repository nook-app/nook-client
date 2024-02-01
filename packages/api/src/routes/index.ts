import { FastifyInstance } from "fastify";
import { getFeeds } from "./getFeeds";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(getFeeds);
};
