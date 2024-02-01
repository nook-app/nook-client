import fastify from "fastify";
import { MongoClient, MongoCollection } from "@flink/common/mongo";
import {
  Content,
  ContentData,
  Entity,
  EventAction,
  EventActionData,
} from "@flink/common/types";
import { ObjectId } from "mongodb";
import { FeedResponseItem } from "../types";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function convertStringsToObjectId(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "string" && ObjectId.isValid(obj[key])) {
      obj[key] = new ObjectId(obj[key]);
    } else if (typeof obj[key] === "object") {
      convertStringsToObjectId(obj[key]);
    }
  }
  return obj;
}

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

  server.post<{ Body: { filter: object } }>(
    "/feeds",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            filter: {
              type: "object",
              additionalProperties: true,
            },
          },
          required: ["filter"],
        },
      },
    },
    async (request, reply) => {
      const collection = client.getCollection<EventAction<EventActionData>>(
        MongoCollection.Actions,
      );
      const actions = await collection
        .find(convertStringsToObjectId(request.body.filter))
        .sort({ timestamp: -1 })
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
        data: actions.map(
          (a) =>
            ({
              _id: a._id.toString(),
              type: a.type,
              timestamp: a.timestamp.toString(),
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
                .reduce(
                  (acc, c) => {
                    acc[c.contentId] = c;
                    return acc;
                  },
                  {} as Record<string, Content<ContentData>>,
                ),
            }) as FeedResponseItem,
        ),
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
