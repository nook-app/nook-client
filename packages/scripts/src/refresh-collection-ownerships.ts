import { QueueName, getWorker } from "@nook/common/queues";

const run = async () => {
  const worker = getWorker(QueueName.OwnershipRefresh, async (job) => {
    const { collectionId } = job.data as { collectionId?: string };

    if (collectionId) {
      console.log(`[${job.id}] processing`);
      await fetch(
        "https://nook-api.up.railway.app/v1/nfts/collections/collectors/farcaster",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            collectionId,
          }),
        },
      );
    }

    console.log(`[${job.id}] processed`);
  });

  worker.on("failed", (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`);
    }
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
