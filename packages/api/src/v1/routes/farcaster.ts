import { FarcasterFeedRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterAPIClient } from "@nook/common/clients";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const api = new FarcasterAPIClient();

    fastify.post<{ Body: FarcasterFeedRequest }>(
      "/feeds/farcaster",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        const response = await api.getFeed({
          ...request.body,
          context: {
            viewerFid,
          },
        });

        return reply.send(response);
      },
    );
  });
};
