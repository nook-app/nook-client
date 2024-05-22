import { QueueName, getWorker } from "@nook/common/queues";

const run = async () => {
  const worker = getWorker(QueueName.OwnershipRefresh, async (job) => {
    const { collectionId, nftId } = job.data as {
      collectionId?: string;
      nftId?: string;
    };

    console.log(`[${job.id}] processing`);
    if (collectionId) {
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
    } else if (nftId) {
      await fetch(
        "https://nook-api.up.railway.app/v1/nfts/collectors/farcaster",
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
