import {
  HubRpcClient,
  getSSLHubRpcClient,
  Message,
  HubResult,
  MessagesResponse,
} from "@farcaster/hub-nodejs";
import {
  FarcasterCast,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUrlReaction,
  PrismaClient,
} from "@nook/common/prisma/farcaster";
import { MongoClient, MongoCollection } from "@nook/common/mongo";
import { RedisClient } from "@nook/common/cache";
import {
  Content,
  ContentActionData,
  ContentData,
  ContentType,
  Entity,
  EventAction,
  EventActionType,
  EventType,
  FarcasterCastData,
  FarcasterCastReactionData,
  FarcasterLinkData,
  RawEvent,
  TopicType,
} from "@nook/common/types";
import {
  bufferToHex,
  toFarcasterURI,
  transformToCastEvent,
  transformToCastReactionEvent,
  transformToLinkEvent,
} from "@nook/common/farcaster";
import {
  backfillCastAdd,
  backfillLinkAdd,
  backfillReactionAdd,
  messageToCast,
  messageToCastReaction,
  messageToLink,
} from "@nook/farcaster/backfill";
import { FarcasterProcessor } from "@nook/events/processors";
import { EventHandlerResponse } from "@nook/events/types";

export class HubSyncProcessor {
  private mongo: MongoClient;
  private cache: RedisClient;
  private hub: HubRpcClient;
  private prisma: PrismaClient;
  private processor: FarcasterProcessor;

  constructor() {
    this.mongo = new MongoClient();
    this.cache = new RedisClient();
    this.prisma = new PrismaClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string, {
      "grpc.max_receive_message_length": 4300000,
    });
    this.processor = new FarcasterProcessor(this.mongo, this.cache);
  }

  async syncFid(fid: number) {
    console.log(`[${fid}] syncing`);
    const entityId = await this.getEntityId(fid);
    if (!entityId) return;
    await Promise.all([
      this.syncCasts(fid, entityId),
      this.syncCastReactions(fid, entityId),
      this.syncUrlReactions(fid, entityId),
      this.syncLinks(fid, entityId),
    ]);
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

  async syncCasts(fid: number, entityId: string) {
    const {
      expectedCount,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    } = await this.getMissingCasts(fid, entityId);

    if (missingFromPostgres.length > 0) {
      console.log(
        `[${fid}] [casts] [postgres] missing ${missingFromPostgres.length}`,
      );

      await this.syncCastsToPostgres(missingFromPostgres);
    } else {
      console.log(`[${fid}] [casts] [postgres] already in sync`);
    }

    if (missingFromMongo.length > 0) {
      console.log(
        `[${fid}] [casts] [mongo] missing ${missingFromMongo.length}`,
      );

      await this.syncCastsToMongo(missingFromMongo);
    } else {
      console.log(`[${fid}] [casts] [mongo] already in sync`);
    }

    if (extraInMongo.length > 0) {
      console.log(`[${fid}] [casts] [mongo] extra ${extraInMongo.length}`);
      await this.mongo
        .getCollection<Content<ContentData>>(MongoCollection.Content)
        .updateMany(
          {
            contentId: {
              $in: extraInMongo,
            },
          },
          {
            $set: {
              deletedAt: new Date(),
            },
          },
        );
    }

    const validations = [];
    if (missingFromPostgres.length > 0) {
      validations.push(this.validateCastsInPostgres(fid, expectedCount));
    }
    if (missingFromMongo.length > 0 || extraInMongo.length > 0) {
      validations.push(this.validateCastsInMongo(fid, entityId, expectedCount));
    }
    await Promise.all(validations);

    console.log(`[${fid}] [casts] synced`);
  }

  async syncCastReactions(fid: number, entityId: string) {
    const {
      expectedCount,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    } = await this.getMissingCastReactions(fid, entityId);

    if (missingFromPostgres.length > 0) {
      console.log(
        `[${fid}] [cast-reactions] [postgres] missing ${missingFromPostgres.length}`,
      );

      await this.syncCastReactionsToPostgres(missingFromPostgres);
    } else {
      console.log(`[${fid}] [cast-reactions] [postgres] already in sync`);
    }

    if (missingFromMongo.length > 0) {
      console.log(
        `[${fid}] [cast-reactions] [mongo] missing ${missingFromMongo.length}`,
      );

      await this.syncCastReactionsToMongo(missingFromMongo);
    } else {
      console.log(`[${fid}] [cast-reactions] [mongo] already in sync`);
    }

    if (extraInMongo.length > 0) {
      console.log(
        `[${fid}] [cast-reactions] [mongo] extra ${extraInMongo.length}`,
      );
      await this.mongo
        .getCollection<EventAction<EventActionType>>(MongoCollection.Actions)
        .updateMany(
          {
            "source.type": EventType.CAST_REACTION_ADD,
            "source.id": {
              $in: extraInMongo,
            },
          },
          {
            $set: {
              deletedAt: new Date(),
            },
          },
        );
    }

    const validations = [];
    if (missingFromPostgres.length > 0) {
      validations.push(
        this.validateCastReactionsInPostgres(fid, expectedCount),
      );
    }
    if (missingFromMongo.length > 0 || extraInMongo.length > 0) {
      validations.push(
        this.validateCastReactionsInMongo(fid, entityId, expectedCount),
      );
    }
    await Promise.all(validations);

    console.log(`[${fid}] [cast-reactions] synced`);
  }

  async syncUrlReactions(fid: number, entityId: string) {
    const {
      expectedCount,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    } = await this.getMissingUrlReactions(fid, entityId);

    if (missingFromPostgres.length > 0) {
      console.log(
        `[${fid}] [url-reactions] [postgres] missing ${missingFromPostgres.length}`,
      );

      await this.syncUrlReactionsToPostgres(missingFromPostgres);
    } else {
      console.log(`[${fid}] [url-reactions] [postgres] already in sync`);
    }

    if (missingFromMongo.length > 0) {
      console.log(
        `[${fid}] [url-reactions] [mongo] missing ${missingFromMongo.length}`,
      );

      await this.syncUrlReactionsToMongo(missingFromMongo);
    } else {
      console.log(`[${fid}] [url-reactions] [mongo] already in sync`);
    }

    if (extraInMongo.length > 0) {
      console.log(
        `[${fid}] [url-reactions] [mongo] extra ${extraInMongo.length}`,
      );
      await this.mongo
        .getCollection<EventAction<EventActionType>>(MongoCollection.Actions)
        .updateMany(
          {
            "source.type": EventType.URL_REACTION_ADD,
            "source.id": {
              $in: extraInMongo,
            },
          },
          {
            $set: {
              deletedAt: new Date(),
            },
          },
        );
    }

    const validations = [];
    if (missingFromPostgres.length > 0) {
      validations.push(this.validateUrlReactionsInPostgres(fid, expectedCount));
    }
    if (missingFromMongo.length > 0 || extraInMongo.length > 0) {
      validations.push(
        this.validateUrlReactionsInMongo(fid, entityId, expectedCount),
      );
    }
    await Promise.all(validations);
  }

  async syncLinks(fid: number, entityId: string) {
    const {
      expectedCount,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    } = await this.getMissingLinks(fid, entityId);

    if (missingFromPostgres.length > 0) {
      console.log(
        `[${fid}] [links] [postgres] missing ${missingFromPostgres.length}`,
      );

      await this.syncLinksToPostgres(missingFromPostgres);
    } else {
      console.log(`[${fid}] [links] [postgres] already in sync`);
    }

    if (missingFromMongo.length > 0) {
      console.log(
        `[${fid}] [links] [mongo] missing ${missingFromMongo.length}`,
      );

      await this.syncLinksToMongo(missingFromMongo);
    } else {
      console.log(`[${fid}] [links] [mongo] already in sync`);
    }

    if (extraInMongo.length > 0) {
      console.log(`[${fid}] [links] [mongo] extra ${extraInMongo.length}`);
      await this.mongo
        .getCollection<EventAction<EventActionType>>(MongoCollection.Actions)
        .updateMany(
          {
            "source.type": EventType.LINK_ADD,
            "source.id": {
              $in: extraInMongo,
            },
          },
          {
            $set: {
              deletedAt: new Date(),
            },
          },
        );
    }

    const validations = [];
    if (missingFromPostgres.length > 0) {
      validations.push(this.validateLinksInPostgres(fid, expectedCount));
    }
    if (missingFromMongo.length > 0 || extraInMongo.length > 0) {
      validations.push(this.validateLinksInMongo(fid, entityId, expectedCount));
    }
    await Promise.all(validations);

    console.log(`[${fid}] [links] synced`);
  }

  async syncCastsToPostgres(messages: Message[]) {
    if (messages.length === 0) return;
    await backfillCastAdd(this.prisma, messages, this.hub);
  }

  async syncCastReactionsToPostgres(messages: Message[]) {
    if (messages.length === 0) return;
    await backfillReactionAdd(this.prisma, messages);
  }

  async syncUrlReactionsToPostgres(messages: Message[]) {
    if (messages.length === 0) return;
    await backfillReactionAdd(this.prisma, messages);
  }

  async syncLinksToPostgres(messages: Message[]) {
    if (messages.length === 0) return;
    await backfillLinkAdd(this.prisma, messages);
  }

  async syncCastsToMongo(messages: Message[]) {
    if (messages.length === 0) return;
    const rawEvents = messages
      .map((message) => {
        const cast = messageToCast(message);
        if (!cast) return;
        return transformToCastEvent(EventType.CAST_ADD, cast);
      })
      .filter(Boolean) as RawEvent<FarcasterCastData>[];

    const response = await this.processor.processCastAddOrRemove(rawEvents);
    await this.handleEventHandlerResponse(response);
  }

  async syncCastReactionsToMongo(messages: Message[]) {
    if (messages.length === 0) return;
    const rawEvents = messages
      .map((message) => {
        const reaction = messageToCastReaction(message);
        if (!reaction) return;
        return transformToCastReactionEvent(
          EventType.CAST_REACTION_ADD,
          reaction,
        );
      })
      .filter(Boolean) as RawEvent<FarcasterCastReactionData>[];

    const response =
      await this.processor.processCastReactionAddOrRemove(rawEvents);
    await this.handleEventHandlerResponse(response);
  }

  async syncUrlReactionsToMongo(messages: Message[]) {
    if (messages.length === 0) return;
    const rawEvents = messages
      .map((message) => {
        const reaction = messageToCastReaction(message);
        if (!reaction) return;
        return transformToCastReactionEvent(
          EventType.CAST_REACTION_ADD,
          reaction,
        );
      })
      .filter(Boolean) as RawEvent<FarcasterCastReactionData>[];

    const response =
      await this.processor.processCastReactionAddOrRemove(rawEvents);
    await this.handleEventHandlerResponse(response);
  }

  async syncLinksToMongo(messages: Message[]) {
    if (messages.length === 0) return;
    const rawEvents = messages
      .map((message) => {
        const link = messageToLink(message);
        if (!link) return;
        return transformToLinkEvent(EventType.LINK_ADD, link);
      })
      .filter(Boolean) as RawEvent<FarcasterLinkData>[];

    const response = await this.processor.processLinkAddOrRemove(rawEvents);
    await this.handleEventHandlerResponse(response);
  }

  async handleEventHandlerResponse(response: EventHandlerResponse) {
    const events = response.events.map(({ event }) => event);
    const actions = response.events.flatMap(
      ({ actions }) => actions,
    ) as EventAction<ContentActionData>[];
    const contents = response.contents || [];

    const promises = [];

    if (events.length > 0) {
      promises.push(
        this.mongo
          .getCollection(MongoCollection.Events)
          .insertMany(events, {
            ordered: false,
          })
          .catch((err) => {
            if (err?.code !== 11000) {
              console.error(err);
            }
          }),
      );
    }

    if (actions.length > 0) {
      promises.push(
        this.mongo
          .getCollection(MongoCollection.Actions)
          .insertMany(actions, {
            ordered: false,
          })
          .catch((err) => {
            if (err?.code !== 11000) {
              console.error(err);
            }
          }),
        this.mongo.getCollection(MongoCollection.Actions).updateMany(
          {
            "source.type": EventType.CAST_REACTION_ADD,
            "source.id": {
              $in: actions.map((action) => action.source.id),
            },
          },
          {
            $set: {
              deletedAt: null,
            },
          },
        ),
      );
    }

    if (contents.length > 0) {
      promises.push(
        this.mongo
          .getCollection(MongoCollection.Content)
          .insertMany(contents, {
            ordered: false,
          })
          .catch((err) => {
            if (err?.code !== 11000) {
              console.error(err);
            }
          }),
        this.mongo.getCollection(MongoCollection.Content).updateMany(
          {
            contentId: {
              $in: contents.map((content) => content.contentId),
            },
          },
          {
            $set: {
              deletedAt: null,
            },
          },
        ),
      );
    }

    await Promise.all(promises);
  }

  async validateCastsInPostgres(fid: number, expectedCount: number) {
    const castsFromPostgres = await this.getCastsFromPostgres(fid);
    if (castsFromPostgres.length !== expectedCount) {
      throw new Error(
        `[${fid}] [casts] [postgres] failed to sync, expected: ${expectedCount}, got: ${castsFromPostgres.length} in postgres`,
      );
    }
  }

  async validateCastsInMongo(
    fid: number,
    entityId: string,
    expectedCount: number,
  ) {
    const castsFromMongo = await this.getCastsFromMongo(entityId);
    if (castsFromMongo.length !== expectedCount) {
      throw new Error(
        `[${fid}] [casts] [mongo] failed to sync, expected: ${expectedCount}, got: ${castsFromMongo.length} in mongo`,
      );
    }
  }

  async validateCastReactionsInPostgres(fid: number, expectedCount: number) {
    const reactionsFromPostgres = await this.getCastReactionsFromPostgres(fid);
    if (reactionsFromPostgres.length !== expectedCount) {
      throw new Error(
        `[${fid}] [cast-reactions] [postgres] failed to sync, expected: ${expectedCount}, got: ${reactionsFromPostgres.length} in postgres`,
      );
    }
  }

  async validateCastReactionsInMongo(
    fid: number,
    entityId: string,
    expectedCount: number,
  ) {
    const reactionsFromMongo = await this.getCastReactionsFromMongo(entityId);
    if (reactionsFromMongo.length !== expectedCount) {
      throw new Error(
        `[${fid}] [cast-reactions] [mongo] failed to sync, expected: ${expectedCount}, got: ${reactionsFromMongo.length} in mongo`,
      );
    }
  }

  async validateUrlReactionsInPostgres(fid: number, expectedCount: number) {
    const reactionsFromPostgres = await this.getUrlReactionsFromPostgres(fid);
    if (reactionsFromPostgres.length !== expectedCount) {
      throw new Error(
        `[${fid}] [url-reactions] [postgres] failed to sync, expected: ${expectedCount}, got: ${reactionsFromPostgres.length} in postgres`,
      );
    }
  }

  async validateUrlReactionsInMongo(
    fid: number,
    entityId: string,
    expectedCount: number,
  ) {
    const reactionsFromMongo = await this.getUrlReactionsFromMongo(entityId);
    if (reactionsFromMongo.length !== expectedCount) {
      throw new Error(
        `[${fid}] [url-reactions] [mongo] failed to sync, expected: ${expectedCount}, got: ${reactionsFromMongo.length} in mongo`,
      );
    }
  }

  async validateLinksInPostgres(fid: number, expectedCount: number) {
    const linksFromPostgres = await this.getLinksFromPostgres(fid);
    if (linksFromPostgres.length !== expectedCount) {
      throw new Error(
        `[${fid}] [links] [postgres] failed to sync, expected: ${expectedCount}, got: ${linksFromPostgres.length} in postgres`,
      );
    }
  }

  async validateLinksInMongo(
    fid: number,
    entityId: string,
    expectedCount: number,
  ) {
    const linksFromMongo = await this.getLinksFromMongo(entityId);
    if (linksFromMongo.length !== expectedCount) {
      throw new Error(
        `[${fid}] [links] [mongo] failed to sync, expected: ${expectedCount}, got: ${linksFromMongo.length} in mongo`,
      );
    }
  }

  // Missing data
  async getMissingCasts(fid: number, entityId: string) {
    const [castsFromHub, castsFromPostgres, castsFromMongo] = await Promise.all(
      [
        this.getCastsFromHub(fid),
        this.getCastsFromPostgres(fid),
        this.getCastsFromMongo(entityId),
      ],
    );

    const postgresHashMap = castsFromPostgres.reduce(
      (acc, cast) => {
        acc[
          toFarcasterURI({
            fid: cast.fid.toString(),
            hash: cast.hash,
          })
        ] = cast;
        return acc;
      },
      {} as Record<string, FarcasterCast>,
    );

    const mongoHashMap = castsFromMongo.reduce(
      (acc, cast) => {
        acc[cast.contentId] = cast;
        return acc;
      },
      {} as Record<string, Content<ContentData>>,
    );

    const hubHashMap = castsFromHub.reduce(
      (acc, cast) => {
        acc[
          toFarcasterURI({
            fid: fid.toString(),
            hash: bufferToHex(cast.hash),
          })
        ] = cast;
        return acc;
      },
      {} as Record<string, Message>,
    );

    const missingFromPostgres = castsFromHub.filter(
      (cast) =>
        !postgresHashMap[
          toFarcasterURI({
            fid: fid.toString(),
            hash: bufferToHex(cast.hash),
          })
        ],
    );

    const missingFromMongo = castsFromHub.filter(
      (cast) =>
        !mongoHashMap[
          toFarcasterURI({
            fid: fid.toString(),
            hash: bufferToHex(cast.hash),
          })
        ],
    );

    const extraInMongo = Object.keys(mongoHashMap).filter(
      (contentId) => !hubHashMap[contentId],
    );

    return {
      expectedCount: castsFromHub.length,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    };
  }

  async getMissingCastReactions(fid: number, entityId: string) {
    const [reactionsFromHub, reactionsFromPostgres, reactionsFromMongo] =
      await Promise.all([
        this.getCastReactionsFromHub(fid),
        this.getCastReactionsFromPostgres(fid),
        this.getCastReactionsFromMongo(entityId),
      ]);

    const postgresHashMap = reactionsFromPostgres.reduce(
      (acc, reaction) => {
        acc[reaction.hash] = reaction;
        return acc;
      },
      {} as Record<string, FarcasterCastReaction>,
    );

    const mongoHashMap = reactionsFromMongo.reduce(
      (acc, reaction) => {
        acc[reaction.source.id] = reaction;
        return acc;
      },
      {} as Record<string, EventAction<EventActionType>>,
    );

    const hubHashMap = reactionsFromHub.reduce(
      (acc, reaction) => {
        acc[bufferToHex(reaction.hash)] = reaction;
        return acc;
      },
      {} as Record<string, Message>,
    );

    const missingFromPostgres = reactionsFromHub.filter(
      (reaction) => !postgresHashMap[bufferToHex(reaction.hash)],
    );

    const missingFromMongo = reactionsFromHub.filter(
      (reaction) => !mongoHashMap[bufferToHex(reaction.hash)],
    );

    const extraInMongo = Object.keys(mongoHashMap).filter(
      (hash) => !hubHashMap[hash],
    );

    return {
      expectedCount: reactionsFromHub.length,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    };
  }

  async getMissingUrlReactions(fid: number, entityId: string) {
    const [reactionsFromHub, reactionsFromPostgres, reactionsFromMongo] =
      await Promise.all([
        this.getUrlReactionsFromHub(fid),
        this.getUrlReactionsFromPostgres(fid),
        this.getUrlReactionsFromMongo(entityId),
      ]);

    const postgresHashMap = reactionsFromPostgres.reduce(
      (acc, reaction) => {
        acc[reaction.hash] = reaction;
        return acc;
      },
      {} as Record<string, FarcasterUrlReaction>,
    );

    const mongoHashMap = reactionsFromMongo.reduce(
      (acc, reaction) => {
        acc[reaction.source.id] = reaction;
        return acc;
      },
      {} as Record<string, EventAction<EventActionType>>,
    );

    const hubHashMap = reactionsFromHub.reduce(
      (acc, reaction) => {
        acc[bufferToHex(reaction.hash)] = reaction;
        return acc;
      },
      {} as Record<string, Message>,
    );

    const missingFromPostgres = reactionsFromHub.filter(
      (reaction) => !postgresHashMap[bufferToHex(reaction.hash)],
    );

    const missingFromMongo = reactionsFromHub.filter(
      (reaction) => !mongoHashMap[bufferToHex(reaction.hash)],
    );

    const extraInMongo = Object.keys(mongoHashMap).filter(
      (hash) => !hubHashMap[hash],
    );

    return {
      expectedCount: reactionsFromHub.length,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    };
  }

  async getMissingLinks(fid: number, entityId: string) {
    const [linksFromHub, linksFromPostgres, linksFromMongo] = await Promise.all(
      [
        this.getLinksFromHub(fid),
        this.getLinksFromPostgres(fid),
        this.getLinksFromMongo(entityId),
      ],
    );

    const postgresHashMap = linksFromPostgres.reduce(
      (acc, link) => {
        acc[link.hash] = link;
        return acc;
      },
      {} as Record<string, FarcasterLink>,
    );

    const mongoHashMap = linksFromMongo.reduce(
      (acc, link) => {
        acc[link.source.id] = link;
        return acc;
      },
      {} as Record<string, EventAction<EventActionType>>,
    );

    const hubHashMap = linksFromHub.reduce(
      (acc, link) => {
        acc[bufferToHex(link.hash)] = link;
        return acc;
      },
      {} as Record<string, Message>,
    );

    const missingFromPostgres = linksFromHub.filter(
      (link) => !postgresHashMap[bufferToHex(link.hash)],
    );

    const missingFromMongo = linksFromHub.filter(
      (link) => !mongoHashMap[bufferToHex(link.hash)],
    );

    const extraInMongo = Object.keys(mongoHashMap).filter(
      (hash) => !hubHashMap[hash],
    );

    return {
      expectedCount: linksFromHub.length,
      missingFromPostgres,
      missingFromMongo,
      extraInMongo,
    };
  }

  // Mongo Calls
  async getCastsFromMongo(entityId: string) {
    return await this.mongo
      .getCollection<Content<ContentData>>(MongoCollection.Content)
      .find({
        type: {
          $in: [ContentType.POST, ContentType.REPLY],
        },
        topics: {
          type: TopicType.SOURCE_ENTITY,
          value: entityId,
        },
        deletedAt: undefined,
      })
      .toArray();
  }

  async getCastReactionsFromMongo(entityId: string) {
    return await this.mongo
      .getCollection<EventAction<EventActionType>>(MongoCollection.Actions)
      .find({
        "source.type": EventType.CAST_REACTION_ADD,
        type: {
          $in: [EventActionType.LIKE, EventActionType.REPOST],
        },
        topics: {
          type: TopicType.SOURCE_ENTITY,
          value: entityId,
        },
        deletedAt: undefined,
      })
      .toArray();
  }

  async getUrlReactionsFromMongo(entityId: string) {
    return await this.mongo
      .getCollection<EventAction<EventActionType>>(MongoCollection.Actions)
      .find({
        "source.type": EventType.URL_REACTION_ADD,
        type: {
          $in: [EventActionType.LIKE, EventActionType.REPOST],
        },
        topics: {
          type: TopicType.SOURCE_ENTITY,
          value: entityId,
        },
        deletedAt: undefined,
      })
      .toArray();
  }

  async getLinksFromMongo(entityId: string) {
    return await this.mongo
      .getCollection<EventAction<EventActionType>>(MongoCollection.Actions)
      .find({
        type: EventActionType.FOLLOW,
        topics: {
          type: TopicType.SOURCE_ENTITY,
          value: entityId,
        },
        deletedAt: undefined,
      })
      .toArray();
  }

  // Postgres Calls
  async getCastsFromPostgres(fid: number) {
    return await this.prisma.farcasterCast.findMany({ where: { fid } });
  }

  async getCastReactionsFromPostgres(fid: number) {
    return await this.prisma.farcasterCastReaction.findMany({
      where: { fid },
    });
  }

  async getUrlReactionsFromPostgres(fid: number) {
    return await this.prisma.farcasterUrlReaction.findMany({
      where: { fid },
    });
  }

  async getLinksFromPostgres(fid: number) {
    return await this.prisma.farcasterLink.findMany({ where: { fid } });
  }

  // Hub Calls

  async getCastsFromHub(fid: number) {
    return await this.getMessagesFromHub(fid, (fid, pageToken) =>
      this.hub.getCastsByFid({ fid, pageToken }),
    );
  }

  async getCastReactionsFromHub(fid: number) {
    return (
      await this.getMessagesFromHub(fid, (fid, pageToken) =>
        this.hub.getReactionsByFid({ fid, pageToken }),
      )
    ).filter((message) => !message.data?.reactionBody?.targetUrl);
  }

  async getUrlReactionsFromHub(fid: number) {
    return (
      await this.getMessagesFromHub(fid, (fid, pageToken) =>
        this.hub.getReactionsByFid({ fid, pageToken }),
      )
    ).filter((message) => message.data?.reactionBody?.targetUrl);
  }

  async getLinksFromHub(fid: number) {
    return await this.getMessagesFromHub(fid, (fid, pageToken) =>
      this.hub.getLinksByFid({ fid, pageToken }),
    );
  }

  async getMessagesFromHub(
    fid: number,
    fn: (
      fid: number,
      pageToken?: Uint8Array,
    ) => Promise<HubResult<MessagesResponse>>,
  ) {
    const messages: Message[] = [];

    let pageToken: Uint8Array | undefined = undefined;
    do {
      const response = await fn(fid, pageToken);

      if (response.isErr()) {
        throw new Error(
          `failed to get messages for fid: ${fid}`,
          response.error,
        );
      }

      messages.push(...response.value.messages);
      pageToken = response.value.nextPageToken;
    } while (pageToken?.length);

    return messages;
  }
}
