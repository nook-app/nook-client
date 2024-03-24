import { FastifyInstance } from "fastify";
import { ContentAPIClient, FarcasterAPIClient } from "@nook/common/clients";
import { ChannelFilterType, UserFilterType } from "@nook/common/types";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new FarcasterAPIClient();
    const content = new ContentAPIClient();

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

    fastify.post<{ Body: { fids: string[] } }>(
      "/farcaster/users",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUsers(
          { fids: request.body.fids },
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
      "/farcaster/users/:fid/posts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/replies",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
            replies: "only",
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/media",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await content.getNewMedia({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        const casts = await client.getCasts(response.data, viewerFid);
        reply.send({
          data: casts.data,
          nextCursor: response.nextCursor,
        });
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/frames",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await content.getNewFrames({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        const casts = await client.getCasts(response.data, viewerFid);
        reply.send({
          data: casts.data,
          nextCursor: response.nextCursor,
        });
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

    fastify.get<{
      Params: { channelId: string };
      Querystring: { cursor?: string };
    }>("/farcaster/channels/:channelId/posts", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await client.getNewPosts({
        data: {
          channels: {
            type: ChannelFilterType.CHANNEL_IDS,
            data: {
              channelIds: [request.params.channelId],
            },
          },
          replies: "include",
        },
        cursor: request.query.cursor,
        context: { viewerFid },
      });
      reply.send(response);
    });

    fastify.get<{
      Params: { channelId: string };
      Querystring: { cursor?: string };
    }>("/farcaster/channels/:channelId/media", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await content.getNewMedia({
        data: {
          channels: {
            type: ChannelFilterType.CHANNEL_IDS,
            data: {
              channelIds: [request.params.channelId],
            },
          },
        },
        cursor: request.query.cursor,
        context: { viewerFid },
      });
      const casts = await client.getCasts(response.data, viewerFid);
      reply.send({
        data: casts.data,
        nextCursor: response.nextCursor,
      });
    });

    fastify.get<{ Querystring: { query?: string; cursor?: string } }>(
      "/farcaster/casts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          data: {
            query: request.query.query || "",
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );
  });
};
