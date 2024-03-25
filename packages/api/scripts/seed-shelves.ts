import { Prisma, PrismaClient } from "@nook/common/prisma/nook";
import {
  ChannelFilterType,
  NookShelf,
  FormComponentType,
  ShelfProtocol,
  ShelfRenderer,
  ShelfType,
  UserFilterType,
} from "@nook/common/types";

const NOOK_FID = "262426";
const NEYNAR_FID = "6131";

const SHELVES: Omit<NookShelf, "id">[] = [
  {
    name: "User List",
    description: "Display a list of user profiles",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_USERS,
    api: `${process.env.FARCASTER_API_ENDPOINT}/users`,
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Users",
              description: "Select a list of users to display",
              field: "users",
              required: true,
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
                limit: 20,
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.USER_LIST],
  },
  {
    name: "User Profile",
    description: "Pin a user's profile",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_USER,
    api: `${process.env.FARCASTER_API_ENDPOINT}/users`,
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Users",
              description: "Select a user to pin",
              field: "users",
              required: true,
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.USER_LIST],
  },
  {
    name: "Post Feed",
    description: "Filter by channels, users, and/or search",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_POSTS,
    api: `${process.env.FARCASTER_API_ENDPOINT}/feed/posts/new`,
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Channels",
              description: "Select a list of channels to filter by",
              field: "channels",
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 20,
              },
            },
            {
              name: "Users",
              description: "Select a list of users to filter by",
              field: "users",
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
                limit: 20,
              },
            },
            {
              name: "Search Term",
              description: "Search for posts by keyword",
              field: "query",
              component: {
                type: FormComponentType.INPUT,
                maxLength: 50,
                placeholder: "Search...",
              },
            },
            {
              name: "Mute words",
              description: "List of words to mute",
              field: "muteWords",
              component: {
                type: FormComponentType.MULTI_INPUT,
                maxLength: 50,
                placeholder: "word",
                limit: 10,
              },
            },
            {
              name: "With Replies",
              description: "Include replies in the feed",
              field: "includeReplies",
              component: {
                type: FormComponentType.SWITCH,
                defaultValue: false,
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.POST_DEFAULT],
  },
  {
    name: "Media Feed",
    description: "Media-only feed with filters",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_MEDIA,
    api: `${process.env.CONTENT_API_ENDPOINT}/feed/media/new`,
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Channels",
              description: "Select a list of channels to filter by",
              field: "channels",
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 20,
              },
            },
            {
              name: "Users",
              description: "Select a list of users to filter by",
              field: "users",
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
                limit: 20,
              },
            },
            {
              name: "With Replies",
              description: "Include replies in the feed",
              field: "includeReplies",
              component: {
                type: FormComponentType.SWITCH,
                defaultValue: false,
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.POST_MEDIA],
  },
  {
    name: "Frame Feed",
    description: "Feed of posts with frames, with filters",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_FRAMES,
    api: `${process.env.CONTENT_API_ENDPOINT}/feed/frames/new`,
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Urls",
              description: "Enter a list of urls to filter by",
              field: "urls",
              component: {
                type: FormComponentType.MULTI_INPUT,
                placeholder: "https://example.com",
                maxLength: 150,
                limit: 10,
              },
            },
            {
              name: "Channels",
              description: "Select a list of channels to filter by",
              field: "channels",
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 20,
              },
            },
            {
              name: "Users",
              description: "Select a list of users to filter by",
              field: "users",
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
                limit: 20,
              },
            },
            {
              name: "With Replies",
              description: "Include replies in the feed",
              field: "includeReplies",
              component: {
                type: FormComponentType.SWITCH,
                defaultValue: false,
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.POST_FRAMES],
  },
  {
    name: "Embed Feed",
    description: "Feed of url mentions, with filters",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_EMBEDS,
    api: `${process.env.CONTENT_API_ENDPOINT}/feed/embeds/new`,
    creatorFid: NOOK_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Urls",
              description: "Enter a list of urls to filter by",
              field: "urls",
              required: true,
              component: {
                type: FormComponentType.MULTI_INPUT,
                placeholder: "https://example.com",
                maxLength: 150,
                limit: 10,
              },
            },
            {
              name: "Channels",
              description: "Select a list of channels to filter by",
              field: "channels",
              component: {
                type: FormComponentType.SELECT_CHANNELS,
                allowed: [ChannelFilterType.CHANNEL_URLS],
                limit: 20,
              },
            },
            {
              name: "Users",
              description: "Select a list of users to filter by",
              field: "users",
              component: {
                type: FormComponentType.SELECT_USERS,
                allowed: [UserFilterType.FIDS],
                limit: 20,
              },
            },
            {
              name: "With Replies",
              description: "Include replies in the feed",
              field: "includeReplies",
              component: {
                type: FormComponentType.SWITCH,
                defaultValue: false,
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.POST_EMBEDS],
  },
  {
    name: "Trending",
    description: "Trending posts using Neynar's algorithm",
    protocol: ShelfProtocol.FARCASTER,
    type: ShelfType.FARCASTER_POSTS,
    api: "https://api.neynar.com/v2/farcaster/feed/trending",
    creatorFid: NEYNAR_FID,
    form: {
      steps: [
        {
          fields: [
            {
              name: "Timeframe",
              description: "Select a timeframe to filter by",
              field: "timeWindow",
              required: true,
              component: {
                type: FormComponentType.SELECT_OPTION,
                options: [
                  {
                    value: "1h",
                    label: "Last Hour",
                  },
                  {
                    value: "6h",
                    label: "Last 6 Hours",
                  },
                  {
                    value: "12h",
                    label: "Last 12 Hours",
                  },
                  {
                    value: "24h",
                    label: "Last 24 Hours",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    renderers: [ShelfRenderer.POST_DEFAULT],
  },
];

const run = async () => {
  const client = new PrismaClient();

  for (const shelf of SHELVES) {
    const existingShelf = await client.shelf.findUnique({
      where: {
        creatorFid_name: {
          creatorFid: shelf.creatorFid,
          name: shelf.name,
        },
      },
    });

    if (existingShelf) {
      await client.shelf.update({
        where: {
          id: existingShelf.id,
        },
        data: {
          ...shelf,
          renderers: shelf.renderers.join(","),
          form: shelf.form as Prisma.InputJsonValue,
        },
      });

      continue;
    }

    await client.shelf.create({
      data: {
        ...shelf,
        form: shelf.form as Prisma.InputJsonValue,
        renderers: shelf.renderers.join(","),
      },
    });
  }
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
