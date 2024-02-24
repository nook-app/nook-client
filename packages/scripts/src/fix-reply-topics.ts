import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Content,
  ContentActionData,
  EventAction,
  EventActionType,
  PostData,
  TopicType,
} from "@nook/common/types";

const fetchContentsWithMissingTopics = async (client: MongoClient) => {
  return client
    .getCollection(MongoCollection.Content)
    .find({
      type: "REPLY",
      topics: {
        $not: {
          $elemMatch: {
            type: "TARGET_CONTENT",
          },
        },
      },
    })
    .limit(100)
    .toArray();
};

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  let contents = await fetchContentsWithMissingTopics(client);
  do {
    console.log(
      `processing ${contents.length} starting from ${contents[0].contentId}`,
    );
    const contentUpdates = [];
    const actionUpdates = [];
    for (const content of contents) {
      const topics = [];
      if (content.data.parentId && content.data.parentEntityId) {
        topics.push({
          type: TopicType.TARGET_ENTITY,
          value: content.data.parentEntityId.toString(),
        });
        topics.push({
          type: TopicType.TARGET_CONTENT,
          value: content.data.parentId,
        });

        if (content.data.parent) {
          for (const mention of content.data.parent.mentions) {
            topics.push({
              type: TopicType.TARGET_TAG,
              value: mention.entityId.toString(),
            });
          }

          for (const embed of content.data.parent.embeds) {
            topics.push({
              type: TopicType.TARGET_EMBED,
              value: embed,
            });
          }
        }
      }

      if (topics.length === 0) continue;

      contentUpdates.push({
        updateOne: {
          filter: { contentId: content.contentId },
          update: {
            $addToSet: {
              topics: { $each: topics },
            },
          },
        },
      });

      actionUpdates.push({
        updateOne: {
          filter: {
            type: EventActionType.REPLY,
            topics: {
              type: TopicType.SOURCE_CONTENT,
              value: content.contentId,
            },
          },
          update: {
            $addToSet: {
              topics: { $each: topics },
            },
          },
        },
      });
    }

    await Promise.all([
      client
        .getCollection<Content<PostData>>(MongoCollection.Content)
        .bulkWrite(contentUpdates),
      client
        .getCollection<EventAction<ContentActionData>>(MongoCollection.Actions)
        .bulkWrite(actionUpdates),
    ]);

    contents = await fetchContentsWithMissingTopics(client);
  } while (contents.length > 0);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
