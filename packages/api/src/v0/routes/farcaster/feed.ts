import { FastifyInstance } from "fastify";
import { FarcasterAPIClient, NookCacheClient } from "@nook/common/clients";
import { FarcasterFeedRequest } from "@nook/common/types/feed";

export const farcasterFeedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new FarcasterAPIClient();
    const cache = new NookCacheClient(fastify.redis.client);

    fastify.post<{ Body: FarcasterFeedRequest }>(
      "/farcaster/casts/feed",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        let mutes: string[] = [];
        if (viewerFid) {
          try {
            mutes = await cache.getUserMutes(viewerFid);
          } catch (e) {}
        }

        try {
          if (!request.body.api) {
            const response = await client.getCastFeed({
              ...request.body,
              context: {
                viewerFid,
                mutedChannels: mutes
                  .filter((m) => m.startsWith("channel:"))
                  .map((m) => m.split(":")[1]),
                mutedUsers: mutes
                  .filter((m) => m.startsWith("user:"))
                  .map((m) => m.split(":")[1]),
                mutedWords: mutes
                  .filter((m) => m.startsWith("word:"))
                  .map((m) => m.split(":")[1]),
              },
            });
            return reply.send(response);
          }

          if (request.body.api.includes("k3l.io")) {
            const response = await fetch(
              `${request.body.api}${
                request.body.cursor ? `?offset=${request.body.cursor}` : ""
              }`,
            );
            if (!response.ok) {
              console.error(await response.text());
              reply.status(500);
              return;
            }
            const {
              result,
            }: {
              result: { cast_hash: string }[];
            } = await response.json();
            const casts = await client.getCasts(
              result.map((r) => r.cast_hash),
              viewerFid,
            );
            return reply.send({
              data: casts.data,
              nextCursor: (Number(request.body.cursor) || 0) + result.length,
            });
          }

          if (request.body.api.includes("api.neynar.com")) {
            const response = await fetch(
              `${request.body.api}?time_window=1h${
                request.body.cursor ? `&cursor=${request.body.cursor}` : ""
              }`,
              {
                headers: {
                  accept: "application/json",
                  api_key: process.env.NEYNAR_API_KEY as string,
                },
              },
            );
            const { casts, next } = await response.json();
            const hashes = casts.map((cast: { hash: string }) => cast.hash);
            const castResponse = await client.getCasts(hashes, viewerFid);
            return reply.send({
              data: castResponse.data,
              nextCursor: next.cursor,
            });
          }

          const response = await fetch(request.body.api, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...request.body,
              api: undefined,
            }),
          });
          if (!response.ok) {
            console.error(await response.text());
            reply.status(500);
            return;
          }
          const {
            data,
            nextCursor,
          }: { data: string[]; nextCursor?: number | string } =
            await response.json();
          const casts = await client.getCasts(data, viewerFid);
          return reply.send({
            data: casts.data,
            nextCursor,
          });
        } catch (e) {
          console.error(e);
          reply.status(500);
        }
      },
    );
  });
};
