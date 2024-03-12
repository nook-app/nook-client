import { PrismaClient } from "@nook/common/prisma/nook";
import { Nook, NookShelfType, UserFilterType } from "@nook/common/types";

const run = async () => {
  const client = new PrismaClient();

  const defaultNooks = await client.nook.findMany({
    where: {
      creatorFid: "262426",
    },
  });

  if (!defaultNooks.find((nook) => nook.name === "Home")) {
    await createNook(client, HOME_NOOK);
  }

  if (!defaultNooks.find((nook) => nook.name === "Images")) {
    await createNook(client, IMAGES_NOOK);
  }

  if (!defaultNooks.find((nook) => nook.name === "Frames")) {
    await createNook(client, FRAMES_NOOK);
  }
};

const createNook = async (client: PrismaClient, nook: Omit<Nook, "id">) => {
  await client.nook.create({
    data: {
      name: nook.name,
      description: nook.description,
      imageUrl: nook.imageUrl,
      creatorFid: nook.creatorFid,
      shelves: {
        createMany: {
          data: nook.shelves.map((shelf) => ({
            name: shelf.name,
            description: shelf.description,
            type: shelf.type,
            args: shelf.args,
          })),
        },
      },
    },
  });
};

const HOME_NOOK: Omit<Nook, "id"> = {
  name: "Home",
  description: "Your personally-curated nook",
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg",
  creatorFid: "262426",
  shelves: [
    {
      id: "following",
      name: "Following",
      description: "From people you follow",
      type: NookShelfType.FarcasterFeed,
      args: {
        userFilter: {
          type: UserFilterType.Following,
          args: {
            degree: 1,
          },
        },
      },
    },
    {
      id: "discover",
      name: "Discover",
      description: "New from people you should follow",
      type: NookShelfType.FarcasterFeed,
      args: {
        userFilter: {
          type: UserFilterType.Following,
          args: {
            degree: 2,
          },
        },
      },
    },
    {
      id: "global",
      name: "Global",
      description: "New globally",
      type: NookShelfType.FarcasterFeed,
      args: {},
    },
  ],
};

const IMAGES_NOOK: Omit<Nook, "id"> = {
  name: "Images",
  description: "Only posts with images",
  imageUrl:
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Picture_icon_BLACK.svg",
  creatorFid: "262426",
  shelves: [
    {
      id: "following",
      name: "Following",
      description: "New from people you follow",
      type: NookShelfType.FarcasterFeed,
      args: {
        userFilter: {
          type: UserFilterType.Following,
          args: {
            degree: 1,
          },
        },
        contentFilter: {
          types: ["image"],
        },
      },
    },
    {
      id: "discover",
      name: "Discover",
      description: "New from people you should follow",
      type: NookShelfType.FarcasterFeed,
      args: {
        userFilter: {
          type: UserFilterType.Following,
          args: {
            degree: 2,
          },
        },
        contentFilter: {
          types: ["image"],
        },
      },
    },
    {
      id: "global",
      name: "Global",
      description: "New globally",
      type: NookShelfType.FarcasterFeed,
      args: {
        contentFilter: {
          types: ["image"],
        },
      },
    },
  ],
};

const FRAMES_NOOK: Omit<Nook, "id"> = {
  name: "Frames",
  description: "Only posts with frames",
  imageUrl:
    "https://visualpharm.com/assets/850/Frame-595b40b65ba036ed117d1c99.svg",
  creatorFid: "262426",
  shelves: [
    {
      id: "following",
      name: "Following",
      description: "New from people you follow",
      type: NookShelfType.FarcasterFeed,
      args: {
        userFilter: {
          type: UserFilterType.Following,
          args: {
            degree: 1,
          },
        },
        contentFilter: {
          frames: true,
        },
      },
    },
    {
      id: "discover",
      name: "Discover",
      description: "New from people you should follow",
      type: NookShelfType.FarcasterFeed,
      args: {
        userFilter: {
          type: UserFilterType.Following,
          args: {
            degree: 2,
          },
        },
        contentFilter: {
          frames: true,
        },
      },
    },
    {
      id: "global",
      name: "Global",
      description: "New globally",
      type: NookShelfType.FarcasterFeed,
      args: {
        contentFilter: {
          frames: true,
        },
      },
    },
  ],
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
