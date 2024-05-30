import { FastifyInstance } from "fastify";
import { FarcasterAPIV1Client, NookCacheClient } from "@nook/common/clients";
import { FarcasterFeedRequest } from "@nook/common/types/feed";

export const farcasterFeedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new FarcasterAPIV1Client();
    const nook = new NookCacheClient(fastify.redis.client);

    fastify.post<{ Body: FarcasterFeedRequest }>(
      "/farcaster/casts/feed",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        try {
          if (!request.body.api) {
            const response = await client.getCasts({
              ...request.body,
              context: {
                viewerFid,
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
            const casts = await client.getCastsForHashes(
              result.map((r) => r.cast_hash),
              viewerFid,
            );

            if (viewerFid) {
              const mutes = await nook.getUserMutes(viewerFid);
              const channels = mutes
                .filter((m) => m.startsWith("channel:"))
                .map((m) => m.split(":")[1]);

              const users = mutes
                .filter((m) => m.startsWith("user:"))
                .map((m) => m.split(":")[1]);

              const words = mutes
                .filter((m) => m.startsWith("word:"))
                .map((m) => m.split(":")[1]);

              const filteredCasts = casts.data.filter((cast) => {
                if (cast.parentUrl && channels.includes(cast.parentUrl)) {
                  return false;
                }
                if (cast.user && users.includes(cast.user.fid)) {
                  return false;
                }
                if (words.some((word) => cast.text.includes(word))) {
                  return false;
                }
                return true;
              });

              return reply.send({
                data: filteredCasts,
                nextCursor: (Number(request.body.cursor) || 0) + result.length,
              });
            }

            return reply.send({
              data: casts.data,
              nextCursor: (Number(request.body.cursor) || 0) + result.length,
            });
          }

          if (request.body.api.includes("api.neynar.com")) {
            const response = await fetch(
              `${request.body.api}?time_window=6h${
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
            const castResponse = await client.getCastsForHashes(
              hashes,
              viewerFid,
            );
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
          const casts = await client.getCastsForHashes(data, viewerFid);
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
