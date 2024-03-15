import { FastifyInstance } from "fastify";
import { GetNftsRequest } from "@nook/common/types";

import { FarcasterAPIClient } from "@nook/common/clients";
import { SimpleHashChain, SimpleHashNFTsResponse } from "./types";

const CHAINS = Object.values(SimpleHashChain).join(",");
const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY || "";

export const nftRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterClient = new FarcasterAPIClient();

    fastify.post<{ Body: GetNftsRequest }>("/nfts", async (request, reply) => {
      await request.jwtVerify();

      const farResponse = await farcasterClient.getUsers([request.body.fid]);
      const addresses = farResponse.data[0].verifiedAddresses;
      // todo: should we trust and fetch a "next" param here?
      let url = `https://api.simplehash.com/api/v0/nfts/owners?chains=${CHAINS}&wallet_addresses=${addresses.join(
        ",",
      )}&queried_wallet_balances=1&limit=25`;
      if (request.body.cursor) {
        url += `&cursor=${request.body.cursor}`;
      }

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

      return reply.send(results);
    });
  });
};
