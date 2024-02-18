import { createApi } from "@reduxjs/toolkit/query/react";
import {
  ContentFeed,
  ContentFeedItem,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from "@flink/api/types";
import { baseQuery } from "@/store/utils";
import { ContentFeedArgs } from "@flink/common/types";

export const nookApi = createApi({
  reducerPath: "nookApi",
  baseQuery,
  endpoints: (builder) => ({
    getContentFeed: builder.query<
      ContentFeed,
      ContentFeedArgs & { cursor?: string }
    >({
      query: (request) => ({
        url: "/content/feed",
        method: "POST",
        body: request,
      }),
    }),
    getContent: builder.query<ContentFeedItem, string>({
      query: (contentId) => ({
        url: "/content",
        method: "POST",
        body: { contentId },
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
