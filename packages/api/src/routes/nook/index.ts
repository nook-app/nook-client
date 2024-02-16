import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nookService";
import {
  GetContentRepliesBody,
  GetPanelParams,
  GetPanelQuery,
} from "../../../types";
import { NookPanelType, TEMPLATE_NOOKS, getPanelData } from "../../../data";
import { ContentType, TopicType } from "@flink/common/types";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);

    fastify.get<{ Params: GetPanelParams; Querystring: GetPanelQuery }>(
      "/nooks/:nookId/shelves/:shelfId/panels/:panelId",
      async (request, reply) => {
        const panel = getPanelData(request.params);
        if (!panel) {
          return reply
            .status(404)
            .send({ status: 404, message: "Panel not found" });
        }

        switch (panel.type) {
          case NookPanelType.ContentFeed: {
            return nookService.getContentFeed(panel.args, request.query.cursor);
          }
          default:
            return reply
              .status(404)
              .send({ status: 404, message: "Panel type not found" });
        }
      },
    );

    fastify.post<{ Body: GetContentRepliesBody }>(
      "/content/replies",
      async (request, reply) => {
        const filter = {
          type: ContentType.REPLY,
          deletedAt: null,
          topics: {
            type: TopicType.TARGET_CONTENT,
            value: request.body.contentId,
          },
        };

        return nookService.getContentFeed(
          { filter, sort: "engagement.likes" },
          request.body.cursor,
        );
      },
    );
  });
};
