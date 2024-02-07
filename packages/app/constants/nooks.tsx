import { Home } from "@tamagui/lucide-icons";
import { ReactNode } from "react";
import { Image } from "tamagui";

export type Nook = {
  id: string;
  name: string;
  icon: ReactNode;
  feeds: NookFeed[];
  theme: string;
};

export type NookFeed = {
  id: string;
  name: string;
  filter: object;
};

export const TEMPLATE_NOOKS: Nook[] = [
  {
    id: "home",
    name: "Home",
    icon: <Home />,
    theme: "pink",
    feeds: [
      {
        id: "new",
        name: "New",
        filter: {
          type: "POST",
          deletedAt: null,
        },
      },
    ],
  },
  {
    id: "variant",
    name: "Variant",
    icon: <Image source={{ uri: "/assets/variant.png" }} />,
    theme: "blue",
    feeds: [
      {
        id: "jesse",
        name: "Jesse",
        filter: {
          type: "POST",
          deletedAt: null,
          topics: {
            type: "SOURCE_ENTITY",
            value: "65c267e83bc9d6f8c05f8434",
          },
        },
      },
      {
        id: "li",
        name: "Li",
        filter: {
          type: "POST",
          deletedAt: null,
          topics: {
            type: "SOURCE_ENTITY",
            value: "65c267ebcf7e2e9d527c3dc2",
          },
        },
      },
      {
        id: "tacos",
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
];
