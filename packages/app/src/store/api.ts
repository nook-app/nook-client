import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ContentFeed,
  ContentFeedItem,
  GetContentRepliesBody,
  GetEntitiesRequest,
  GetEntitiesResponse,
  GetPanelParams,
  GetPanelQuery,
} from "@flink/api/types";
import { CONFIG } from "@/constants/index";
import { getSession } from "@/utils/session";

const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.apiBaseUrl,
  prepareHeaders: async (headers) => {
    const session = await getSession();
    if (session) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (builder) => ({
    getPanel: builder.query<ContentFeed, GetPanelParams & GetPanelQuery>({
      query: (request) => ({
        url: `/nooks/${request.nookId}/shelves/${request.shelfId}/panels/${request.panelId}`,
        method: "GET",
        params: { cursor: request.cursor },
        headers: {},
      }),
    }),
    getContent: builder.query<ContentFeedItem, string>({
      query: (contentId) => ({
        url: "/content",
        method: "POST",
        body: { contentId },
      }),
    }),
    getContentReplies: builder.query<ContentFeed, GetContentRepliesBody>({
      query: (request) => ({
        url: "/content/replies",
        method: "POST",
        body: request,
      }),
    }),
    getEntities: builder.query<GetEntitiesResponse, GetEntitiesRequest>({
      query: (request) => ({
        url: "/entities",
        method: "POST",
        body: request,
      }),
    }),
  }),
});
