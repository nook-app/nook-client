import fastify, { FastifyRequest } from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  Content,
  ContentData,
  Entity,
  EventAction,
  EventActionData,
  EventActionType,
} from "@flink/common/types";
import { ObjectId } from "mongodb";

const FEED_FILTERS = {
  1: { type: EventActionType.POST },
  2: { type: { $in: [EventActionType.LIKE, EventActionType.REPOST] } },
  3: { entityId: new ObjectId("65ba475d191eb695a5defebc") },
  4: {
    entityId: { $ne: new ObjectId("65ba475d191eb695a5defebc") },
    entityIds: new ObjectId("65ba475d191eb695a5defebc"),
  },
  5: {
    type: { $in: [EventActionType.POST, EventActionType.REPLY] },
    contentIds: { $regex: "i.imgur.com" },
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  const server = fastify({
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  server.get<{ Params: { feedId: string } }>(
    "/feed/:feedId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            feedId: { type: "string" },
          },
          required: ["feedId"],
        },
      },
    },
    async (request, reply) => {
      const collection = client.getCollection<EventAction<EventActionData>>(
        MongoCollection.Actions,
      );
      const actions = await collection
        .find(
          FEED_FILTERS[
            Number(request.params.feedId) as keyof typeof FEED_FILTERS
          ] || FEED_FILTERS[1],
        )
        .limit(25)
        .toArray();

      const entityIds = actions.flatMap((a) => a.entityIds);
      const entities = await client
        .getCollection<Entity>(MongoCollection.Entity)
        .find({ _id: { $in: entityIds } })
        .toArray();
      const entityMap = entities.reduce(
        (acc, e) => {
          acc[e._id.toString()] = e;
          return acc;
        },
        {} as Record<string, Entity>,
      );

      const contentIds = actions.flatMap((a) => a.contentIds);
      const contents = await client
        .getCollection<Content<ContentData>>(MongoCollection.Content)
        .find({ contentId: { $in: contentIds } })
        .toArray();
      const contentMap = contents.reduce(
        (acc, c) => {
          acc[c.contentId] = c;
          return acc;
        },
        {} as Record<string, Content<ContentData>>,
      );

      return {
        status: "ok",
        actions: actions.map((a) => ({
          type: a.type,
          timestamp: a.timestamp,
          data: a.data,
          entity: entityMap[a.entityId.toString()],
          entityMap: a.entityIds
            .map((id) => entityMap[id.toString()])
            .filter(Boolean)
            .reduce(
              (acc, e) => {
                acc[e._id.toString()] = e;
                return acc;
              },
              {} as Record<string, Entity>,
            ),
          contentMap: a.contentIds
            .map((id) => contentMap[id])
            .filter(Boolean)
            .reduce((acc, c) => {
              acc[c.contentId] = c;
              return acc;
            }, {} as { [contentId: string]: Content<ContentData> }),
        })),
      };
    },
  );

  const port = Number(process.env.PORT || "3000");
  await server.listen({ port, host: "0.0.0.0" });
  console.log(`Listening on :${port}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
