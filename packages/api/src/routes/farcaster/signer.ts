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
  });
};
