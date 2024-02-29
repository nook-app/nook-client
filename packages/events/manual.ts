import { QueueName, getQueue } from "@nook/common/queues";
import { getEventsHandler } from "./handlers";
import { FarcasterClient } from "@nook/common/clients";
import { transformToCastEvent } from "@nook/common/farcaster";
import { FarcasterEventType } from "@nook/common/types";

const run = async () => {
  const client = new FarcasterClient();
  const queue = getQueue(QueueName.Events);
  console.log(`Running for event ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  if (job) {
    const handler = await getEventsHandler();
    await handler(job);
  } else if (process.argv[2].startsWith("FARCASTER-CAST_ADD")) {
    const handler = await getEventsHandler();
    const cast = await client.fetchCast(
      process.argv[2].replace("FARCASTER-CAST_ADD-", ""),
    );
    if (!cast) return;
    // @ts-ignore
    await handler({
      data: transformToCastEvent(FarcasterEventType.CAST_ADD, cast),
    });
  }
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
