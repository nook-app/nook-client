import { FastifyInstance } from "fastify";
import {
  GetNftCollectionRequest,
  GetNftRequest,
  GetNftsRequest as GetFidNftsRequest,
  NftsByIdsOrRangeRequest,
  SimpleHashChain,
  SimpleHashNFT,
  SimpleHashNFTsResponse,
  NftFeedRequest,
} from "@nook/common/types";

import { FarcasterAPIClient } from "@nook/common/clients";

const CHAINS = Object.values(SimpleHashChain).join(",");
const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY || "";

export const nftRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterClient = new FarcasterAPIClient();

    fastify.post<{
      Params: GetFidNftsRequest;
      Body: NftFeedRequest;
    }>("/nfts/:fid", async (request, reply) => {
      await request.jwtVerify();

      const farResponse = await farcasterClient.getUser(request.params.fid);
      const addresses = farResponse.verifiedAddresses;

      if (!addresses || addresses.length === 0) {
        return reply.send({
          nfts: [],
        });
      }

      const chains = request.body?.filter?.chains || CHAINS;

      // todo: should we trust and fetch a "next" param here?
      const url = `https://api.simplehash.com/api/v0/nfts/owners?chains=${chains}&wallet_addresses=${addresses
        .map((x) => x.address)
        .join(",")}&queried_wallet_balances=1&limit=25${
        request.body?.cursor ? `&cursor=${request.body?.cursor}` : ""
      }`;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-KEY": SIMPLEHASH_API_KEY,
        },
      };

      const results = (await (
        await fetch(url, options)
      ).json()) as unknown as SimpleHashNFTsResponse;

      return reply.send({
        data: results.nfts.map((nft) => ({
          chain: nft.chain,
          contractAddress: nft.contract_address,
          tokenId: nft.token_id,
          name: nft.name,
          description: nft.description,
          previews: nft.previews,
          imageProperties: nft.image_properties,
          videoUrl: nft.video_url,
          videoProperties: nft.video_properties,
          audioUrl: nft.audio_url,
          audioProperties: nft.audio_properties,
          modelUrl: nft.model_url,
          modelProperties: nft.model_properties,
          externalUrl: nft.external_url,
          createdAt: nft.created_date,
          tokenCount: nft.token_count,
          ownerCount: nft.owner_count,
        })),
        nextCursor: results.next_cursor,
      });
    });

    fastify.get<{ Params: GetNftRequest }>(
      "/nfts/:chain/:address/:identifier",
      async (request, reply) => {
        await request.jwtVerify();

        const url = `https://api.simplehash.com/api/v0/nfts/${request.params.chain}/${request.params.address}/${request.params.identifier}`;

        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            "X-API-KEY": SIMPLEHASH_API_KEY,
          },
        };

        const result = (await (
          await fetch(url, options)
        ).json()) as unknown as SimpleHashNFT;

        return reply.send(result);
      },
    );

    fastify.get<{
      Params: GetNftCollectionRequest;
      Querystring: { cursor?: string };
    }>("/nfts/:chain/:address", async (request, reply) => {
      await request.jwtVerify();
      const cursor = request.query.cursor;

      const url = `https://api.simplehash.com/api/v0/nfts/${
        request.params.chain
      }/${request.params.address}${cursor ? `?cursor=${cursor}` : ""}`;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-KEY": SIMPLEHASH_API_KEY,
        },
      };

      const result = (await (
        await fetch(url, options)
      ).json()) as unknown as SimpleHashNFTsResponse;

      return reply.send(result);
    });

    fastify.post<{
      Params: GetNftCollectionRequest;
      Body: NftsByIdsOrRangeRequest;
    }>("/nfts/:chain/:address", async (request, reply) => {
      await request.jwtVerify();
      if (!request.body.ids && !request.body.range) {
        return reply.status(400).send({
          error: "ids or range must be provided",
        });
      }
      if (request.body.ids && request.body.range) {
        return reply.status(400).send({
          error: "ids and range cannot be provided together",
        });
      }

      let tokenIds: string[] = [];

      if (request.body.ids) {
        tokenIds = request.body.ids.map(
          (id) => `${request.params.chain}.${request.params.address}.${id}`,
        );
      } else if (request.body.range) {
        tokenIds = [];
        for (
          let i = request.body.range.start;
          i <= request.body.range.end;
          i++
        ) {
          tokenIds.push(
            `${request.params.chain}.${request.params.address}.${i}`,
          );
        }
      }

      if (tokenIds.length === 0) {
        return reply.status(400).send({
          error: "ids or range of length >=1 must be provided",
        });
      }
      if (tokenIds.length > 50) {
        return reply.status(400).send({
          error: "number of ids or range length must be <=50",
        });
      }

      const url = `https://api.simplehash.com/api/v0/nfts/assets?nft_ids=${tokenIds.join(
        ",",
      )}`;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "X-API-KEY": SIMPLEHASH_API_KEY,
        },
      };

      const result = (await (
        await fetch(url, options)
      ).json()) as unknown as SimpleHashNFTsResponse;

      return reply.send(result);
    });
  });
};
