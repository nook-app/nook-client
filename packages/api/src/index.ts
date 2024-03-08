import fastify from "fastify";
import { cachePlugin, nookPlugin } from "./plugins";
import { nookRoutes } from "./routes/nook";
import { userRoutes } from "./routes/user";
import fastifyJwt from "@fastify/jwt";
import { farcasterRoutes } from "./routes/farcaster";
import { farcasterSignerRoutes } from "./routes/farcaster/signer";

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

  app.register(nookPlugin);
  app.register(cachePlugin);

  app.register(nookRoutes, { prefix: "/v0" });
  app.register(userRoutes, { prefix: "/v0" });
  app.register(farcasterRoutes, { prefix: "/v0" });
  app.register(farcasterSignerRoutes, { prefix: "/v0" });

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
