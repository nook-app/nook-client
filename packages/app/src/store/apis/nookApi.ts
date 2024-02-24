import { createApi } from "@reduxjs/toolkit/query/react";
import {
  ActionFeed,
  ContentFeed,
  ContentFeedItem,
  GetEntitiesRequest,
  GetEntitiesResponse,
  GetNookRequest,
  SearchChannelsRequest,
  SearchChannelsResponse,
} from "@nook/api/types";
import { baseQuery } from "@/store/utils";
import { Channel, ContentFeedArgs, Entity, Nook } from "@nook/common/types";

export const nookApi = createApi({
  reducerPath: "nookApi",
  baseQuery,
  endpoints: (builder) => ({
    getActionsFeed: builder.query<
      ActionFeed,
      ContentFeedArgs & { cursor?: string }
    >({
      query: (request) => ({
        url: "/actions/feed",
        method: "POST",
        body: request,
      }),
    }),
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
    getEntities: builder.query<Entity[], GetEntitiesRequest>({
      query: (request) => ({
        url: "/entities",
        method: "POST",
        body: request,
      }),
      transformResponse: (response: GetEntitiesResponse) => {
        return response.data;
      },
    }),
    getNook: builder.query<Nook, GetNookRequest>({
      query: (request) => ({
        url: "/nooks",
        method: "POST",
        body: request,
      }),
    }),
    searchChannels: builder.query<Channel[], SearchChannelsRequest>({
      query: (request) => ({
        url: "/channels",
        method: "POST",
        params: request,
      }),
      transformResponse: (response: SearchChannelsResponse) => {
        return response.data;
      },
    }),
  }),
});
