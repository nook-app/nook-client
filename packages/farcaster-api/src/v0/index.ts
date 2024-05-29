import { FastifyInstance } from "fastify";
import { feedRoutes } from "./routes/feed";
import { userRoutes } from "./routes/user";
import { castRoutes } from "./routes/cast";
import { channelRoutes } from "./routes/channel";

export const registerV0Routes = async (fastify: FastifyInstance) => {
  fastify.register(feedRoutes);
  fastify.register(userRoutes);
  fastify.register(castRoutes);
  fastify.register(channelRoutes);
};
