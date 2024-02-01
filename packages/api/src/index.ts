import fastify from "fastify";
import { feedRoutes } from "./routes";
import { bigIntToJson } from "./utils";
import { mongoPlugin } from "./plugins";

const buildApp = () => {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  bigIntToJson(); // Apply BigInt toJSON patch

  app.register(mongoPlugin);

  app.register(feedRoutes);

  return app;
};

const start = async () => {
  const app = buildApp();
  try {
    const port = Number(process.env.PORT || "3000");
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Listening on :${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
