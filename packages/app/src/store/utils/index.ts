import { CONFIG } from "@/constants/index";
import { getSession } from "@/utils/session";
import {
  ContentType,
  Nook,
  NookPanelType,
  NookType,
  UserFilterType,
} from "@nook/common/types";
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

export const generateHomeNook = (entityId: string): Nook => {
  return {
    _id: "home",
    nookId: "home",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg",
    name: "Home",
    description: "Your personally-curated nook",
    slug: "home",
    type: NookType.Default,
    shelves: [
      {
        name: "Following",
        slug: "following",
        description: "Posts from people you follow",
        panels: [
          {
            name: "New",
            slug: "new",
            data: {
              type: NookPanelType.UserPosts,
              args: {
                userFilter: {
                  type: UserFilterType.Following,
                  args: {
                    entityId,
                  },
                },
                contentTypes: [ContentType.POST],
              },
            },
          },
        ],
      },
    ],
    creatorId: "system",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
