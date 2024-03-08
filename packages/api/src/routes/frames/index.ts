import { FastifyInstance } from "fastify";
import { SubmitFrameActionRequest } from "@nook/common/types";
import { SignerAPIClient } from "@nook/common/clients";

export const frameRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const signerClient = new SignerAPIClient();

    fastify.post<{ Body: SubmitFrameActionRequest }>(
      "/frames/action",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        console.log(
          await signerClient.submitFrameAction(
            request.headers.authorization,
            request.body,
          ),
        );
        return reply.send({});
      },
    );
  });
};
