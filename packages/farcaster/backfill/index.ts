import { FarcasterBackfillProcessor } from "./processor";

const run = async () => {
  const processor = new FarcasterBackfillProcessor();
  await processor.backfillFid(Number(process.argv[2]));
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
