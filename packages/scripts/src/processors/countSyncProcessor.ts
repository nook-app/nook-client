import { MongoClient, MongoCollection } from "@nook/common/mongo";
import {
  Content,
  ContentType,
  Entity,
  EventAction,
  EventActionType,
  TopicType,
} from "@nook/common/types";
import { ObjectId } from "mongodb";

export class CountSyncProcessor {
  private mongo: MongoClient;

  constructor() {
    this.mongo = new MongoClient();
  }

  async syncFid(fid: number) {
    console.log(`[${fid}] syncing`);
    const entityId = await this.getEntityId(fid);
    if (!entityId) return;
    await this.syncFollowers(fid, entityId);
    await this.syncCastEngagement(fid, entityId);
    console.log(`[${fid}] synced`);
  }

  async getEntityId(fid: number) {
    const entity = await this.mongo
      .getCollection<Entity>(MongoCollection.Entity)
      .findOne({ "farcaster.fid": fid.toString() });
    if (!entity) {
      return;
    }
    return entity._id.toString();
  }

  async syncFollowers(fid: number, entityId: string) {
    const [followers, following] = await Promise.all([
      this.getFollowers(entityId),
      this.getFollowing(entityId),
    ]);

    await this.mongo.getCollection<Entity>(MongoCollection.Entity).updateOne(
      { _id: new ObjectId(entityId) },
      {
        $set: {
          "farcaster.followers": followers,
          "farcaster.following": following,
        },
      },
    );

    console.log(`[${fid}] followers: ${followers}, following: ${following}`);
  }

  async getFollowers(entityId: string) {
    const followers = await this.mongo
      .getCollection<EventAction>(MongoCollection.Actions)
      .countDocuments({
        type: EventActionType.FOLLOW,
        topics: {
          type: TopicType.TARGET_ENTITY,
          value: entityId,
        },
      });
    return followers;
  }

  async getFollowing(entityId: string) {
    const following = await this.mongo
      .getCollection<EventAction>(MongoCollection.Actions)
      .countDocuments({
        type: EventActionType.FOLLOW,
        topics: {
          type: TopicType.SOURCE_ENTITY,
          value: entityId,
        },
      });
    return following;
  }

  async syncCastEngagement(fid: number, entityId: string) {
    const contents = await this.mongo
      .getCollection<Content>(MongoCollection.Content)
      .find({
        type: {
          $in: [ContentType.POST, ContentType.REPLY],
        },
        topics: {
          type: TopicType.SOURCE_ENTITY,
          value: entityId,
        },
      })
      .toArray();

    console.log(`[${fid}] syncing ${contents.length} contents for engagement`);

    const engagementCounts = await Promise.all(
      contents.map((content) =>
        this.getCastEngagementCounts(content.contentId),
      ),
    );

    if (engagementCounts.length > 0) {
      await this.mongo
        .getCollection<Content>(MongoCollection.Content)
        .bulkWrite(
          engagementCounts.map((counts, i) => ({
            updateOne: {
              filter: { contentId: counts.contentId },
              update: {
                $set: {
                  engagement: {
                    likes: counts.likes,
                    reposts: counts.reposts,
                    replies: counts.replies,
                    embeds: counts.embeds,
                  },
                },
              },
            },
          })),
          {
            ordered: false,
          },
        );
    }
  }

  async getCastEngagementCounts(contentId: string) {
    const [likes, reposts, replies, embeds] = await Promise.all([
      this.getCastLikes(contentId),
      this.getCastReposts(contentId),
      this.getCastReplies(contentId),
      this.getCastEmbeds(contentId),
    ]);
    return {
      contentId,
      likes,
      reposts,
      replies,
      embeds,
    };
  }

  async getCastLikes(contentId: string) {
    const likes = await this.mongo
      .getCollection<EventAction>(MongoCollection.Actions)
      .countDocuments({
        type: EventActionType.LIKE,
        topics: {
          type: TopicType.TARGET_CONTENT,
          value: contentId,
        },
      });
    return likes;
  }

  async getCastReposts(contentId: string) {
    const reposts = await this.mongo
      .getCollection<EventAction>(MongoCollection.Actions)
      .countDocuments({
        type: EventActionType.REPOST,
        topics: {
          type: TopicType.TARGET_CONTENT,
          value: contentId,
        },
      });
    return reposts;
  }

  async getCastReplies(contentId: string) {
    const replies = await this.mongo
      .getCollection<Content>(MongoCollection.Content)
      .countDocuments({
        "data.parentId": contentId,
      });
    return replies;
  }

  async getCastEmbeds(contentId: string) {
    const embeds = await this.mongo
      .getCollection<EventAction>(MongoCollection.Actions)
      .countDocuments({
        type: {
          $in: [EventActionType.POST, EventActionType.REPLY],
        },
        topics: {
          type: TopicType.SOURCE_EMBED,
          value: contentId,
        },
      });
    return embeds;
  }
}
