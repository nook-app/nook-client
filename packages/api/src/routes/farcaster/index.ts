import { FastifyInstance } from "fastify";
import { FarcasterAPIClient } from "@nook/common/clients";
import { FarcasterFeedFilter } from "@nook/common/types";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new FarcasterAPIClient();

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCast(request.params.hash, viewerFid);
        if (!response) {
          reply.status(404);
          return;
        }
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/replies",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastReplies(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/quotes",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastQuotes(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/likes",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastLikes(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/recasts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastRecasts(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Querystring: { query: string; cursor?: string } }>(
      "/farcaster/users",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.searchUsers(
          request.query.query,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string } }>(
      "/farcaster/users/:fid",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUser(request.params.fid, viewerFid);
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/followers",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUserFollowers(
          request.params.fid,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/following",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUserFollowing(
          request.params.fid,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.post<{
      Body: FarcasterFeedFilter;
      Querystring: { cursor?: string };
    }>("/farcaster/feed", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const response = await client.getFeed(
        { filter: request.body, context: { viewerFid: fid } },
        request.query.cursor,
      );
      return reply.send(response);
    });

    fastify.get<{ Querystring: { query: string; cursor?: string } }>(
      "/farcaster/channels",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.searchChannels(
          request.query.query,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );
  });
};
