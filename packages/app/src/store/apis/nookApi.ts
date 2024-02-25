import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/utils";
import { Channel, ContentFeedArgs, Nook } from "@nook/common/types";
import {
  EntityWithContext,
  GetActionFeedResponse,
  GetContentFeedResponse,
  GetContentResponse,
} from "@nook/api/types";

export const nookApi = createApi({
  reducerPath: "nookApi",
  baseQuery,
  endpoints: (builder) => ({
    getActionsFeed: builder.query<
      GetActionFeedResponse,
      ContentFeedArgs & { cursor?: string }
    >({
      query: (request) => ({
        url: "/actions/feed",
        method: "POST",
        body: request,
      }),
    }),
    getContentFeed: builder.query<
      GetContentFeedResponse,
      ContentFeedArgs & { cursor?: string }
    >({
      query: (request) => ({
        url: "/content/feed",
        method: "POST",
        body: request,
      }),
    }),
    getContent: builder.query<GetContentResponse, string>({
      query: (contentId) => ({
        url: "/content",
        method: "POST",
        body: { contentId },
      }),
    }),
    getEntities: builder.query<EntityWithContext[], { entityIds: string[] }>({
      query: (request) => ({
        url: "/entities",
        method: "POST",
        body: request,
      }),
    }),
    getNook: builder.query<Nook, { nookId: string }>({
      query: (request) => ({
        url: "/nooks",
        method: "POST",
        body: request,
      }),
    }),
    searchChannels: builder.query<Channel[], { search: string }>({
      query: (request) => ({
        url: "/channels",
        method: "POST",
        params: request,
      }),
    }),
  }),
});
