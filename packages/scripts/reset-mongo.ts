import { MongoClient, MongoCollection } from "@flink/common/mongo";

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  await client.getCollection(MongoCollection.Entity).drop().catch();
  await Promise.all([
    client.getCollection(MongoCollection.Content).drop().catch(),
    client.getCollection(MongoCollection.Actions).drop().catch(),
    client.getCollection(MongoCollection.Events).drop().catch(),
  ]);

  await Promise.all([
    client
      .getCollection(MongoCollection.Actions)
      .createIndex({ eventId: 1, type: 1 }),
    client
      .getCollection(MongoCollection.Actions)
      .createIndex({ "source.id": 1 }),
    client.getCollection(MongoCollection.Content).createIndex({ contentId: 1 }),
    client
      .getCollection(MongoCollection.Entity)
      .createIndex({ "farcaster.fid": 1 }),
    client.getCollection(MongoCollection.Events).createIndex({ eventId: 1 }),
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
