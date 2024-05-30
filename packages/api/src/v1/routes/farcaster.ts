import { FarcasterFeedRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterAPIV1Client } from "@nook/common/clients";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const api = new FarcasterAPIV1Client();

    fastify.post<{ Body: FarcasterFeedRequest }>(
      "/farcaster/casts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        const response = await api.getCasts(request.body, viewerFid);

        return reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        const response = await api.getCast(request.params.hash, viewerFid);

        return reply.send(response);
      },
    );

    fastify.get<{
      Params: { username: string };
      Querystring: { fid?: boolean };
    }>("/farcaster/users/:username", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await api.getUser(
        request.params.username,
        request.query.fid,
        viewerFid,
      );

      return reply.send(response);
    });
  });
};
