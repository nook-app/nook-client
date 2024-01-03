import { ConnectionOptions, Job, Queue, QueueOptions, Worker } from "bullmq";
import { Content, RawEvent } from "../types";
import { Message } from "@farcaster/hub-nodejs";

export enum QueueName {
  FarcasterIngress = "farcaster-ingress",
  Events = "events",
  ContentIngress = "content-ingress",
}

type QueueType = {
  [QueueName.FarcasterIngress]: Message;
  [QueueName.Events]: RawEvent;
  [QueueName.ContentIngress]: Content;
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

export const getQueue = <N extends QueueName>(
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
