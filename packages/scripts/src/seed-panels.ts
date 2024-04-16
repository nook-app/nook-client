import { PrismaClient } from "@nook/common/prisma/nook";
import { PanelDisplay } from "@nook/common/types";

const DEFAULT_PANELS = [
  {
    type: "default",
    key: "following",
    name: "Following",
  },
  {
    type: "default",
    key: "trending",
    name: "Trending",
  },
  {
    type: "default",
    key: "latest",
    name: "Latest",
  },
  {
    type: "default",
    key: "frames-following",
    name: "Following",
    display: PanelDisplay.FRAMES,
  },
  {
    type: "default",
    key: "frames-trending",
    name: "Trending",
    display: PanelDisplay.FRAMES,
  },
  {
    type: "default",
    key: "frames-latest",
    name: "Latest",
    display: PanelDisplay.FRAMES,
  },
  {
    type: "default",
    key: "media-following",
    name: "Following",
    display: PanelDisplay.MEDIA,
  },
  {
    type: "default",
    key: "media-latest",
    name: "Latest",
    display: PanelDisplay.MEDIA,
  },
  {
    type: "default",
    key: "videos-latest",
    name: "Videos",
    display: PanelDisplay.MEDIA,
  },
];

const run = async () => {
  const client = new PrismaClient();

  await Promise.all(
    DEFAULT_PANELS.map(async (panel) => {
      await client.panel.upsert({
        where: {
          type_key: {
            type: panel.type,
            key: panel.key,
          },
        },
        create: {
          type: panel.type,
          key: panel.key,
          name: panel.name,
          display: panel.display,
        },
        update: {
          name: panel.name,
          display: panel.display,
        },
      });
    }),
  );
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
