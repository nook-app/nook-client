import { ConnectionOptions, Job, Queue, QueueOptions, Worker } from "bullmq";
import { ContentRequest, RawEvent } from "../types";
import { Message } from "@farcaster/hub-nodejs";

export enum QueueName {
  FarcasterIngress = "farcaster-ingress",
  Events = "events",
  ContentIngress = "content-ingress",
}

type QueueType<T> = {
  [QueueName.FarcasterIngress]: Message;
  [QueueName.Events]: RawEvent<T>;
  [QueueName.ContentIngress]: ContentRequest;
};

const connection: ConnectionOptions = {
  host: process.env.DRAGONFLY_HOST,
  port: process.env.DRAGONFLY_PORT as unknown as number,
  username: process.env.DRAGONFLY_USER,
  password: process.env.DRAGONFLY_PASSWORD,
};

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
