import { MongoClient, MongoCollection } from "@flink/common/mongo";

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  await client.getCollection(MongoCollection.Entity).deleteMany({});
  await Promise.all([
    client.getCollection(MongoCollection.Content).deleteMany({}),
    client.getCollection(MongoCollection.Actions).deleteMany({}),
    client.getCollection(MongoCollection.Events).deleteMany({}),
  ]);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
