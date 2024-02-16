import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ContentFeed,
  GetContentRepliesBody,
  GetPanelParams,
  GetPanelQuery,
} from "@flink/api/types";
import { CONFIG } from "@/constants/index";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: CONFIG.apiBaseUrl }),
  endpoints: (builder) => ({
    getPanel: builder.query<ContentFeed, GetPanelParams & GetPanelQuery>({
      query: (request) => ({
        url: `/nooks/${request.nookId}/shelves/${request.shelfId}/panels/${request.panelId}`,
        method: "GET",
        params: { cursor: request.cursor },
      }),
    }),
    getContentReplies: builder.query<ContentFeed, GetContentRepliesBody>({
      query: (request) => ({
        url: "/content/replies",
        method: "POST",
        body: request,
      }),
    }),
  }),
});
