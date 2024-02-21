import { MongoClient, MongoCollection } from "@nook/common/mongo";

const dropCollectionIfExists = async (
  client: MongoClient,
  collection: MongoCollection,
) => {
  const collections = await client.getDb().listCollections().toArray();
  if (collections.some((c) => c.name === collection)) {
    await client.getCollection(collection).drop().catch();
  }
};

const run = async () => {
  const client = new MongoClient();
  await client.connect();

  await dropCollectionIfExists(client, MongoCollection.Entity);
  await client.getCollection(MongoCollection.Entity).createIndex(
    { "farcaster.fid": 1 },
    {
      unique: true,
    },
  );
  await Promise.all([
    dropCollectionIfExists(client, MongoCollection.Content),
    dropCollectionIfExists(client, MongoCollection.Actions),
    dropCollectionIfExists(client, MongoCollection.Events),
  ]);

  await Promise.all([
    client
      .getCollection(MongoCollection.Actions)
      .createIndex({ eventId: 1, type: 1 }, { unique: true }),
    client
      .getCollection(MongoCollection.Actions)
      .createIndex({ "source.id": 1 }),
    client.getCollection(MongoCollection.Content).createIndex(
      { contentId: 1 },
      {
        unique: true,
      },
    ),
    client
      .getCollection(MongoCollection.Events)
      .createIndex({ eventId: 1 }, { unique: true }),
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
