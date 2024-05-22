import {
  GetNftCollectionCollectorsRequest,
  GetNftCollectionEventsRequest,
  GetNftCollectorsRequest,
  GetNftEventsRequest,
  NftFeedRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { NftService } from "../services/nft";

export const nftRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new NftService(fastify);

    fastify.post<{ Body: NftFeedRequest }>("/nfts", async (request, reply) => {
      const response = await service.getNfts(request.body);
      return reply.send(response);
    });

    fastify.post<{ Body: NftFeedRequest }>(
      "/nfts/collections",
      async (request, reply) => {
        const response = await service.getNftCollections(request.body);
        return reply.send(response);
      },
    );

    fastify.get<{ Params: { nftId: string } }>(
      "/nfts/:nftId",
      async (request, reply) => {
        const response = await service.getNft(request.params.nftId);
        return reply.send(response);
      },
    );

    fastify.post<{
      Body: GetNftEventsRequest;
    }>("/nfts/events", async (request, reply) => {
      const response = await service.getNftEvents(request.body);
      return reply.send(response);
    });

    fastify.get<{ Params: { collectionId: string } }>(
      "/nfts/collections/:collectionId",
      async (request, reply) => {
        const response = await service.getNftCollection(
          request.params.collectionId,
        );

        return reply.send(response);
      },
    );

    fastify.post<{
      Body: GetNftCollectionEventsRequest;
    }>("/nfts/collections/events", async (request, reply) => {
      const response = await service.getNftCollectionEvents(request.body);
      return reply.send(response);
    });

    fastify.get<{
      Params: { collectionId: string };
      Querystring: { cursor?: string };
    }>("/nfts/collections/:collectionId/nfts", async (request, reply) => {
      const response = await service.getNftCollectionNfts(
        request.params.collectionId,
        request.query.cursor,
      );

      return reply.send(response);
    });

    fastify.get<{ Params: { collectionId: string } }>(
      "/nfts/collections/:collectionId/mutuals-preview",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };

        const response = await service.getCollectionMutualsPreview(
          request.params.collectionId,
          fid,
        );

        return reply.send(response);
      },
    );

    fastify.post<{
      Body: GetNftCollectionCollectorsRequest;
    }>("/nfts/collections/collectors", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await service.getCollectionCollectors({
        ...request.body,
        viewerFid,
      });

      return reply.send(response);
    });

    fastify.post<{
      Body: GetNftCollectionCollectorsRequest;
    }>("/nfts/collections/collectors/farcaster", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await service.getCollectionFarcasterCollectors({
        ...request.body,
        viewerFid,
      });

      return reply.send(response);
    });

    fastify.post<{
      Body: GetNftCollectionCollectorsRequest;
    }>("/nfts/collections/collectors/following", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };

      const response = await service.getCollectionFollowingCollectors(
        request.body,
        fid,
      );

      return reply.send(response);
    });

    fastify.post<{
      Body: GetNftCollectorsRequest;
    }>("/nfts/collectors", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await service.getCollectors({
        ...request.body,
        viewerFid,
      });

      return reply.send(response);
    });

    fastify.post<{
      Body: GetNftCollectorsRequest;
    }>("/nfts/collectors/farcaster", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await service.getFarcasterCollectors({
        ...request.body,
        viewerFid,
      });

      return reply.send(response);
    });

    fastify.post<{
      Body: GetNftCollectorsRequest;
    }>("/nfts/collectors/following", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };

      const response = await service.getFollowingCollectors(request.body, fid);

      return reply.send(response);
    });
  });
};
