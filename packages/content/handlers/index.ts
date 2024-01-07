import { ContentRequest } from "@flink/common/types";
import { MongoClient } from "@flink/common/mongo";
import { Job } from "bullmq";
import { getAndTransformCastAddToContent } from "./farcaster";
import { HandlerArgs } from "../types";

export const getContentHandler = async () => {
  const client = new MongoClient();
  await client.connect();

  return async (job: Job<ContentRequest>) => {
    const args: HandlerArgs = {
      client,
      request: job.data,
    };

    let handler: (args: HandlerArgs) => Promise<void> | undefined;

    if (job.data.contentId.startsWith("farcaster://cast/")) {
      handler = getAndTransformCastAddToContent;
    } else {
      console.log(
        `[content] not processing url content right now ${job.data.contentId}`,
      );
      return;
    }

    if (!handler) {
      throw new Error(`[content] [${job.data.contentId}] no handler found`);
    }

    await getAndTransformCastAddToContent(args);

    console.log(`[content] [${job.data.contentId}] processed`);
  };
};
