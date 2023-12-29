import { ConnectionOptions, Job, Queue, QueueOptions, Worker } from "bullmq";

export enum QueueName {
  FarcasterEvent = "farcaster-event",
  Funnel = "funnel",
}

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

export const getQueue = (queueName: QueueName) => {
  return new Queue(formatQueueName(queueName), queueOptions);
};

export const getWorker = (
  queueName: QueueName,
  jobFunction: (job: Job) => Promise<void>,
) => {
  return new Worker(formatQueueName(queueName), jobFunction, {
    connection,
  });
};
