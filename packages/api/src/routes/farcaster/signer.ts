import { FastifyInstance } from "fastify";
import { FarcasterAPIClient, SignerAPIClient } from "@nook/common/clients";
import {
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
  SubmitUserDataAddRequest,
} from "@nook/common/types";

export const farcasterSignerRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new SignerAPIClient();
    const farcaster = new FarcasterAPIClient();

    fastify.get("/signer", async (request, reply) => {
      if (!request.headers.authorization) {
        return reply.code(401).send({ message: "Unauthorized" });
      }
      try {
        const response = await client.getSigner(request.headers.authorization);
        return reply.send(response);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get<{ Params: { address: string } }>(
      "/signer/:address",
      async (request, reply) => {
        try {
          const response = await client.getPendingSigner(
            request.params.address,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get<{ Querystring: { token: string } }>(
      "/signer/validate",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.validateSigner(
            request.headers.authorization,
            request.query.token,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: { data: SubmitCastAddRequest[] } }>(
      "/signer/cast-add/thread",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitCastAddThread(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitCastAddRequest }>(
      "/signer/cast-add",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitCastAdd(
            request.headers.authorization,
            request.body,
          );
          if ("message" in response) {
            return reply.code(400).send(response);
          }
          if (response.hashes && response.hashes.length > 0) {
            await farcaster.getCast(
              response.hashes[response.hashes.length - 1],
            );
          }
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitCastRemoveRequest }>(
      "/signer/cast-remove",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitCastRemove(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitReactionAddRequest }>(
      "/signer/reaction-add",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitReactionAdd(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitReactionRemoveRequest }>(
      "/signer/reaction-remove",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitReactionRemove(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitLinkAddRequest }>(
      "/signer/link-add",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitLinkAdd(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitLinkRemoveRequest }>(
      "/signer/link-remove",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitLinkRemove(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitUserDataAddRequest }>(
      "/signer/user-data-add",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const response = await client.submitUserDataAdd(
            request.headers.authorization,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
