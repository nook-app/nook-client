import { GetPanelParams } from "../types";

export type Nook = {
  id: string;
  name: string;
  description: string;
  image: string;
  shelves: NookShelf[];
  theme: string;
};

export type NookShelf = {
  id: string;
  name: string;
  description: string;
  panels: NookPanel[];
};

export enum NookPanelType {
  ContentFeed = "CONTENT_FEED",
}

export type ContentFeedArgs = {
  // biome-ignore lint/suspicious/noExplicitAny: filter is a dynamic object
  filter: Record<string, any>;
  sort?: string;
  sortDirection?: number;
};

export type NookPanel = {
  id: string;
  name: string;
  type: NookPanelType;
  args: ContentFeedArgs;
};

export const TEMPLATE_NOOKS: Nook[] = [
  {
    id: "degen",
    name: "$DEGEN",
    description:
      "Degen, an ERC-20 token on Base, launched in January 2024 with an airdrop to the Degen channel community on Farcaster. ",
    image: "https://www.degen.tips/logo_light.svg",
    theme: "purple",
    shelves: [
      {
        id: "trending_posts",
        name: "Trending Posts",
        description: "Most tipped posts with $DEGEN",
        panels: [
          {
            id: "channel",
            type: NookPanelType.ContentFeed,
            name: "Most Tipped",
            args: {
              filter: {
                type: "POST",
                deletedAt: null,
              },
              sort: "tips.chain://eip155:8453/erc20:0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa.amount",
              sortDirection: -1,
            },
          },
        ],
      },
      {
        id: "new_posts",
        name: "New Posts",
        description: "New posts about $DEGEN",
        panels: [
          {
            id: "channel",
            type: NookPanelType.ContentFeed,
            name: "/degen",
            args: {
              filter: {
                type: "POST",
                deletedAt: null,
                topics: {
                  type: "CHANNEL",
                  value:
                    "chain://eip155:7777777/erc721:0x5d6a07d07354f8793d1ca06280c4adf04767ad7e",
                },
              },
            },
          },
          {
            id: "mentions",
            type: NookPanelType.ContentFeed,
            name: "Mentions",
            args: {
              filter: {
                type: "POST",
                deletedAt: null,
                "data.text": {
                  $regex: "\\$DEGEN",
                  $options: "i",
                },
              },
            },
          },
        ],
      },
      {
        id: "tips",
        name: "Tips",
        description: "Tips from the $DEGEN community",
        panels: [
          {
            id: "tips",
            type: NookPanelType.ContentFeed,
            name: "Tips",
            args: {
              filter: {
                type: "REPLY",
                deletedAt: null,
                "data.text": {
                  $regex: "[0-9]+\\s*\\$DEGEN",
                  $options: "i",
                },
              },
            },
          },
        ],
      },
    ],
  },
];

export const getPanelData = ({ nookId, shelfId, panelId }: GetPanelParams) => {
  const nook = TEMPLATE_NOOKS.find((nook) => nook.id === nookId);
  if (!nook) return;
  const shelf = nook.shelves.find((shelf) => shelf.id === shelfId);
  if (!shelf) return;
  return shelf.panels.find((panel) => panel.id === panelId);
};
