export * from "./enqueue";
import Redis from "ioredis";
import { Job, Queue, QueueOptions, Worker } from "bullmq";
import { EventActionRequest, RawEvent } from "../types";
import { Message } from "@farcaster/hub-nodejs";
import { FarcasterBackfillRequest } from "../types/backfill";

export enum QueueName {
  Farcaster = "farcaster",
  FarcasterBackfill = "farcaster-backfill",
  Events = "events",
  EventsBackfill = "events-backfill",
  Actions = "actions",
}

type QueueType<T> = {
  [QueueName.Farcaster]: Message;
  [QueueName.FarcasterBackfill]: FarcasterBackfillRequest;
  [QueueName.Events]: RawEvent<T>;
  [QueueName.EventsBackfill]: RawEvent<T>;
  [QueueName.Actions]: EventActionRequest;
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
