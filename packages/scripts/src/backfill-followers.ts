import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Entity,
  EntityActionData,
  EventAction,
  EventActionType,
  TopicType,
} from "@nook/common/types";
import { ObjectId } from "mongodb";

type FollowerData = Record<string, { following: number; followers: number }>;

const $match = {
  type: EventActionType.FOLLOW,
  deletedAt: null,
};

const $facet = {
  following: [
    {
      $group: {
        _id: {
          entityId: "$data.entityId",
        },
        following: {
          $sum: 1,
        },
      },
    },
  ],
  followers: [
    {
      $group: {
        _id: {
          entityId: "$data.targetEntityId",
        },
        followers: {
          $sum: 1,
        },
      },
    },
  ],
};

const fetchFollowerData = async (client: MongoClient) => {
  const collection = client.getCollection<EventAction<EventActionType>>(
    MongoCollection.Actions,
  );
  const result = await collection
    .aggregate([
      {
        $match,
      },
      { $facet },
    ])
    .next();

  if (!result) {
    throw new Error("No result found");
  }

  const entityMap: FollowerData = {};
  for (const {
    _id: { entityId },
    following,
  } of result.following) {
    entityMap[entityId] = { following, followers: 0 };
  }
  for (const {
    _id: { entityId },
    followers,
  } of result.followers) {
    if (entityMap[entityId]) {
      entityMap[entityId].followers = followers;
    } else {
      entityMap[entityId] = { following: 0, followers };
    }
  }

  return entityMap;
};

const updateFollowerData = async (
  client: MongoClient,
  followerData: FollowerData,
) => {
  const collection = client.getCollection<Entity>(MongoCollection.Entity);
  const bulk = collection.initializeUnorderedBulkOp();
  for (const [entityId, { following, followers }] of Object.entries(
    followerData,
  )) {
    bulk.find({ _id: new ObjectId(entityId) }).updateOne({
      $set: {
        "farcaster.following": following,
        "farcaster.followers": followers,
      },
    });
  }
  await bulk.execute();
};

const run = async () => {
  const hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string, {
    "grpc.max_receive_message_length": 4300000,
  });

  const client = new MongoClient();
  await client.connect();

  // const result = await client
  //   .getCollection<EventAction<EntityActionData>>(MongoCollection.Actions)
  //   .find({
  //     type: EventActionType.FOLLOW,
  //     topics: {
  //       type: TopicType.TARGET_ENTITY,
  //       value: "65d6d626bcf8dea3200bb8f7",
  //     },
  //   })
  //   .toArray();

  // const distinctFids = new Set<string>();
  // for (const action of result) {
  //   distinctFids.add(action.data.sourceUserId);
  // }

  // console.log(distinctFids.size);
  // return;

  let totalMessages = 0;
  let pageToken = undefined;
  let morePages = true;

  while (morePages) {
    console.log(totalMessages);
    const response = await hub.getReactionsByFid({
      fid: 3,
      pageToken: pageToken,
    });
    if (response.isOk()) {
      totalMessages += response.value.messages.length;
      pageToken = response.value.nextPageToken;
      morePages = !!pageToken;
    } else {
      morePages = false;
    }
  }

  console.log(totalMessages);
  // console.time("fetchFollowerData");
  // const followerData = await fetchFollowerData(client);
  // console.timeEnd("fetchFollowerData");

  // console.time("updateFollowerData");
  // await updateFollowerData(client, followerData);
  // console.timeEnd("updateFollowerData");
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
