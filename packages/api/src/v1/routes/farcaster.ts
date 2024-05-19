import { FarcasterFeedRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../services/farcaster";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterService = new FarcasterService(fastify);

    fastify.put<{ Body: FarcasterFeedRequest }>(
      "/feed/farcaster",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        const response = await farcasterService.getFeed({
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
