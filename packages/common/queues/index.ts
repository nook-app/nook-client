export * from "./enqueue";
import Redis from "ioredis";
import { Job, Queue, QueueOptions, Worker } from "bullmq";
import {
  EntityEventData,
  EntityEvent,
  Notification,
  FarcasterContentReference,
} from "../types";
import { Message } from "@farcaster/hub-nodejs";
import { PendingCast } from "../prisma/nook";

export enum QueueName {
  Farcaster = "farcaster",
  Backfill = "backfill",
  Events = "events",
  EventsPriority = "events-priority",
  Notifications = "notifications",
  ScheduledCast = "scheduled-cast",
  Content = "content",
  OwnershipRefresh = "ownership-refresh",
}

type QueueType = {
  [QueueName.Backfill]: { fid: string };
  [QueueName.Farcaster]: Message;
  [QueueName.Events]: EntityEvent<EntityEventData>;
  [QueueName.EventsPriority]: EntityEvent<EntityEventData>;
  [QueueName.Notifications]: Notification;
  [QueueName.ScheduledCast]: PendingCast;
  [QueueName.Content]: FarcasterContentReference;
  [QueueName.OwnershipRefresh]: {
    collectionId?: string;
    nftId?: string;
    tokenId?: string;
  };
};

const connection = new Redis({
  host: process.env.DRAGONFLY_HOST,
  port: Number(process.env.DRAGONFLY_PORT),
  username: process.env.DRAGONFLY_USER,
  password: process.env.DRAGONFLY_PASSWORD,
  maxRetriesPerRequest: null,
});

const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
};

const formatQueueName = (queueName: QueueName) => {
  return `{${queueName}}`;
};

export const getQueue = <N extends QueueName, T>(
  queueName: N,
): Queue<QueueType[N]> => {
  return new Queue<QueueType[N]>(formatQueueName(queueName), queueOptions);
};

export const getWorker = <N extends QueueName>(
  queueName: N,
  jobFunction: (job: Job<QueueType[N]>) => Promise<void>,
): Worker<QueueType[N]> => {
  return new Worker(formatQueueName(queueName), jobFunction, {
    connection,
  });
};
