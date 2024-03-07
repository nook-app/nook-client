import { FastifyInstance } from "fastify";
import { SignerAPIClient } from "@nook/common/clients";
import {
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
} from "@nook/common/types";

export const farcasterSignerRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new SignerAPIClient();

    fastify.post<{ Body: SubmitCastAddRequest }>(
      "/signer/cast-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await client.submitCastAdd(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitCastRemoveRequest }>(
      "/signer/cast-remove",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await client.submitCastRemove(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitReactionAddRequest }>(
      "/signer/reaction-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await client.submitReactionAdd(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitReactionRemoveRequest }>(
      "/signer/reaction-remove",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await client.submitReactionRemove(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitLinkAddRequest }>(
      "/signer/link-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await client.submitLinkAdd(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitLinkRemoveRequest }>(
      "/signer/link-remove",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await client.submitLinkRemove(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
