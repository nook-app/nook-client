import { FastifyInstance } from "fastify";
import { getFeeds } from "./getFeeds";
import { authFarcaster } from "./authFarcaster";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(getFeeds);
};

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.register(authFarcaster);
};
