import { MongoClient, MongoCollection } from "@nook/common/mongo";

const run = async () => {
  const client = new MongoClient();
  await client.connect();
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
