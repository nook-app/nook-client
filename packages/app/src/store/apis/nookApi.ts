import { createApi } from "@reduxjs/toolkit/query/react";
import {
  ContentFeed,
  ContentFeedItem,
  GetEntitiesRequest,
  GetEntitiesResponse,
  GetNookRequest,
} from "@nook/api/types";
import { baseQuery } from "@/store/utils";
import { ContentFeedArgs, Nook } from "@nook/common/types";

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
    getNook: builder.query<Nook, GetNookRequest>({
      query: (request) => ({
        url: "/nooks",
        method: "POST",
        body: request,
      }),
    }),
  }),
});
