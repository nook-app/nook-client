import { QueueName, getQueue } from "@nook/common/queues";
import { getActionsHandler } from "./handlers";

const run = async () => {
  const queue = getQueue(QueueName.Actions);
  console.log(`Running for event ${process.argv[2]}`);
  const job = await queue.getJob(process.argv[2]);
  const handler = await getActionsHandler();
  // @ts-ignore
  await handler({ data: { actionId: process.argv[2], created: true } });
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
