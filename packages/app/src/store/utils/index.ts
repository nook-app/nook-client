import { CONFIG } from "@/constants/index";
import { getSession } from "@/utils/session";
import { NookPanelType, NookResponse } from "@nook/common/types";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.apiBaseUrl,
  prepareHeaders: async (headers) => {
    const session = await getSession();
    if (session) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const generateHomeNook = (entityId: string): NookResponse => {
  return {
    id: "home",
    creator: {
      id: "nook",
      farcaster: {
        fid: "0",
      },
      blockchain: [],
      usernames: [],
    },
    name: "Home",
    description: "Your personally-curated nook",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg",
    metadata: {
      shelves: [
        {
          id: "founders",
          name: "Founders",
          description: "For founders",
          panels: [
            {
              id: "new",
              name: "New",
              description: "New posts from founders",
              data: {
                type: NookPanelType.FarcasterFeed,
                args: {
                  feedId: "channel:https://farcaster.group/founders",
                },
              },
            },
          ],
        },
      ],
    },
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  };
};
