export * from "./enqueue";
import Redis from "ioredis";
import { Job, Queue, QueueOptions, Worker } from "bullmq";
import { EntityEventData, RawEvent } from "../types";
import { Message } from "@farcaster/hub-nodejs";

export enum QueueName {
  Farcaster = "farcaster",
  FarcasterBackfill = "farcaster-backfill",
  Events = "events",
  Content = "content",
  Actions = "actions",
}

type QueueType<T> = {
  [QueueName.Farcaster]: Message;
  [QueueName.FarcasterBackfill]: { fid: string };
  [QueueName.Events]: RawEvent<EntityEventData>;
  [QueueName.Content]: { contentId: string; channel?: boolean };
  [QueueName.Actions]: { actionId: string; created: boolean };
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
): Queue<QueueType<T>[N]> => {
  return new Queue<QueueType<T>[N]>(formatQueueName(queueName), queueOptions);
};

export const getWorker = <N extends QueueName, T>(
  queueName: N,
  jobFunction: (job: Job<QueueType<T>[N]>) => Promise<void>,
): Worker<QueueType<T>[N]> => {
  return new Worker(formatQueueName(queueName), jobFunction, {
    connection,
  });
};
