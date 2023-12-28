import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { QueueName, getQueue } from "@flink/common";
import fastify from "fastify";

const setupBullBoardServerAdapter = () => {
  const serverAdapter = new FastifyAdapter();
  createBullBoard({
    queues: [new BullMQAdapter(getQueue(QueueName.FarcasterEvent))],
    serverAdapter,
  });
  serverAdapter.setBasePath("/");
  return serverAdapter;
};

const setupServer = () => {
  const server = fastify();
  const serverAdapter = setupBullBoardServerAdapter();
  server.register(serverAdapter.registerPlugin(), {
    prefix: "/",
    basePath: "/",
  });

  return server;
};

const run = async () => {
  const server = setupServer();
  const port = Number(process.env.PORT || "3000");
  await server.listen({ port, host: "0.0.0.0" });
  console.log(`Listening on :${port}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
