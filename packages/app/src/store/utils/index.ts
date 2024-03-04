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

export const generateHomeNook = (fid: string): NookResponse => {
  return {
    id: "home",
    creator: {
      id: "nook",
      farcaster: {
        fid: "262426",
        engagement: {
          followers: 0,
          following: 0,
        },
      },
    },
    name: "Home",
    description: "Your personally-curated nook",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg",
    metadata: {
      shelves: [
        {
          id: "following",
          name: "Following",
          description: "Posts from people you follow",
          panels: [
            {
              id: "new",
              name: "New",
              description: "New posts from people you follow",
              data: {
                type: NookPanelType.FarcasterFeed,
                args: {
                  feedId: `user:following:${fid}`,
                },
              },
            },
          ],
        },
        {
          id: "ogs",
          name: "Farcaster OGs",
          description: "Posts from Farcaster OGs",
          panels: [
            {
              id: "new",
              name: "New",
              description: "New posts from Farcaster OGs",
              data: {
                type: NookPanelType.FarcasterFeed,
                args: {
                  feedId: "custom:farcaster-og",
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
