import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";

async function generateToken() {
  console.log("generating token");
  console.log(process.argv);
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });
  const fid = process.argv[2];
  console.log(fid);

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });
  const token = app.jwt.sign(
    {
      fid: fid,
    },
    { expiresIn: 3600 },
  );
  console.log(token);
}
generateToken();
