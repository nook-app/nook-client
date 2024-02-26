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
    name: "Home",
    slug: "home",
    type: NookType.Default,
    shelves: [
      {
        name: "main",
        slug: "main",
        description: "Main feed",
        panels: [
          {
            name: "Posts",
            slug: "posts",
            data: {
              type: NookPanelType.UserPosts,
              args: {
                userFilter: {
                  type: UserFilterType.Entities,
                  args: {
                    entityIds: [entityId],
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
