import { farcasterRoutes } from "./routes/farcaster";
import { farcasterSignerRoutes } from "./routes/farcaster/signer";
import { frameRoutes } from "./routes/frames";
import { contentRoutes } from "./routes/content";
import { notificationsRoutes } from "./routes/notifications";
import { transactionRoutes } from "./routes/transactions";
import { flagRoutes } from "./routes/flags";
import { pendingCastRoutes } from "./routes/pending";
import { farcasterFeedRoutes } from "./routes/farcaster/feed";
import { FastifyInstance } from "fastify";

export const registerV0Routes = async (fastify: FastifyInstance) => {
  fastify.register(contentRoutes, { prefix: "/v0" });
  fastify.register(farcasterRoutes, { prefix: "/v0" });
  fastify.register(farcasterFeedRoutes, { prefix: "/v0" });
  fastify.register(farcasterSignerRoutes, { prefix: "/v0" });
  fastify.register(frameRoutes, { prefix: "/v0" });
  fastify.register(transactionRoutes, { prefix: "/v0" });
  fastify.register(notificationsRoutes, { prefix: "/v0" });
  fastify.register(flagRoutes, { prefix: "/v0" });
  fastify.register(pendingCastRoutes, { prefix: "/v0" });
};
