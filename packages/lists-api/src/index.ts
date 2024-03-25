import fastify from "fastify";
import { listsPlugin } from "./plugins";
import { listsRoutes } from "./routes";
import fastifyJwt from "@fastify/jwt";

const buildApp = () => {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Automatically convert BigInts to strings when serializing to JSON
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });

  app.register(listsPlugin);
  app.register(listsRoutes);

  return app;
};

const start = async () => {
  const app = buildApp();
  try {
    const port = Number(process.env.PORT || "3005");
    await app.listen({ port, host: "::" });
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
