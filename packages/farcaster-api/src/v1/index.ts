import { FastifyInstance } from "fastify";
import { castRoutes } from "./routes/cast";
import { userRoutes } from "./routes/user";
import { channelRoutes } from "./routes/channel";

export const registerV1Routes = async (fastify: FastifyInstance) => {
  fastify.register(castRoutes, { prefix: "/v1" });
  fastify.register(userRoutes, { prefix: "/v1" });
  fastify.register(channelRoutes, { prefix: "/v1" });
};
