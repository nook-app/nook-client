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

export type NookPanel = {
  id: string;
  type: "feed";
  name: string;
  filter: object;
};

export const TEMPLATE_NOOKS: Nook[] = [
  {
    id: "home",
    name: "Home",
    description: "Your personal nook",
    image:
      "data:image/png;base64,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",
    theme: "pink",
    shelves: [
      {
        id: "you",
        name: "You",
        description: "Your posts and activity",
        panels: [
          {
            id: "posts",
            type: "feed",
            name: "Posts",
            filter: {
              type: "POST",
              deletedAt: null,
              topics: {
                type: "SOURCE_ENTITY",
                value: "65c267d588a53b67527cda70",
              },
            },
          },
          {
            id: "replies",
            type: "feed",
            name: "Replies",
            filter: {
              type: "REPLY",
              deletedAt: null,
              topics: {
                type: "SOURCE_ENTITY",
                value: "65c267d588a53b67527cda70",
              },
            },
          },
        ],
      },
      {
        id: "wall",
        name: "Wall",
        description: "Your public channel",
        panels: [
          {
            id: "new",
            type: "feed",
            name: "New",
            filter: {
              type: "POST",
              deletedAt: null,
              topics: {
                type: "CHANNEL",
                value: "https://warpcast.com/~/channel/six",
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "variant",
    name: "Variant",
    description:
      "First-check crypto venture capital firm investing in an internet that turns users into owners.",
    image:
      "https://pbs.twimg.com/profile_images/1650581692988686336/YcZGb4Ds_400x400.jpg",
    theme: "blue",
    shelves: [
      {
        id: "team",
        name: "Team",
        description: "Posts from the Variant team",
        panels: [
          {
            id: "team",
            type: "feed",
            name: "Team",
            filter: {
              type: "POST",
              deletedAt: null,
              topics: {
                $elemMatch: {
                  type: "SOURCE_ENTITY",
                  value: {
                    $in: [
                      "65c267e83bc9d6f8c05f8434",
                      "65c267ebcf7e2e9d527c3dc2",
                      "65c267e2bb9b20a7ae714cfc",
                      "65c267e888a53b67527cdc89",
                      "65c267e83bc9d6f8c05f8433",
                      "65c2680b6fe79b1c764dbcac",
                      "65c26d23522d7aa4a9cdfb6b",
                      "65c26db74a1d7d35d2003621",
                      "65c2e19dca6361c90a114851",
                      "65c2e1ab72604338e575cfe2",
                    ],
                  },
                },
              },
            },
          },
        ],
      },
      {
        id: "channels",
        name: "Channels",
        description: "Variant public channels",
        panels: [
          {
            id: "variant",
            type: "feed",
            name: "Variant",
            filter: {
              type: "POST",
              deletedAt: null,
              topics: {
                type: "CHANNEL",
                value: "https://warpcast.com/~/channel/variant",
              },
            },
          },
          {
            id: "tacos",
            type: "feed",
            name: "Taco Tuesdays",
            filter: {
              type: "POST",
              deletedAt: null,
              topics: {
                type: "CHANNEL",
                value: "https://warpcast.com/~/channel/tacotuesdays",
              },
            },
          },
        ],
      },
      {
        id: "essays",
        name: "Essays",
        description: "Recent essays from Variant",
        panels: [],
      },
    ],
  },
  {
    id: "degen",
    name: "$DEGEN",
    description:
      "Degen, an ERC-20 token on Base, launched in January 2024 with an airdrop to the Degen channel community on Farcaster. ",
    image: "https://www.degen.tips/logo_light.svg",
    theme: "purple",
    shelves: [
      {
        id: "posts",
        name: "Posts",
        description: "Posts about $DEGEN",
        panels: [
          {
            id: "channel",
            type: "feed",
            name: "/degen",
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
          {
            id: "mentions",
            type: "feed",
            name: "Mentions",
            filter: {
              type: "POST",
              deletedAt: null,
              "data.text": {
                $regex: "\\$DEGEN",
                $options: "i",
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
            type: "feed",
            name: "Tips",
            filter: {
              type: "REPLY",
              deletedAt: null,
              "data.text": {
                $regex: "[0-9]+\\s*\\$DEGEN",
                $options: "i",
              },
            },
          },
        ],
      },
    ],
  },
];
