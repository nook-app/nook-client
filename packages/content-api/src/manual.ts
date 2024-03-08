import { getUrlContent } from "./utils";

const run = async () => {
  const url = process.argv[2];

  const content = await getUrlContent(url);
  console.log(content);
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
