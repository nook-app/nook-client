import fastify from "fastify";
import { redisPlugin, nookPlugin, userPlugin } from "./plugins";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import { registerV0Routes } from "./v0";
import { registerV1Routes } from "./v1";

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

  app.register(fastifyCors, {
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://localhost") ||
        origin.startsWith("https://farcon.localhost") ||
        [
          "https://nook-next.vercel.app",
          "https://nook.social",
          "https://farcon.nook.social",
        ].includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
  });

  app.register(nookPlugin);
  app.register(redisPlugin);
  app.register(userPlugin);

  registerV0Routes(app);
  registerV1Routes(app);

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
