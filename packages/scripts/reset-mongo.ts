import { MongoClient, MongoCollection } from "@flink/common/mongo";

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  await Promise.all(
    Object.values(MongoCollection).map(async (collection) => {
      await client.getCollection(collection).deleteMany({});
    }),
  );
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
