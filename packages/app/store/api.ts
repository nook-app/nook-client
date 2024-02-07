import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ContentFeedItem,
  GetContentFeedRequest,
  GetContentFeedResponse,
} from "@flink/api/types";
import { API_BASE_URL } from "@constants/index";
import { ContentData } from "@flink/common/types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getContentFeed: builder.query<
      ContentFeedItem<ContentData>[],
      GetContentFeedRequest
    >({
      query: (request) => {
        return {
          url: "/feeds",
          method: "POST",
          body: request,
        };
      },
      transformResponse: (response: GetContentFeedResponse) => response.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return { endpointName, filter: queryArgs.filter };
      },
      merge: (currentCache, newItems) => {
        currentCache.push(...newItems);
      },
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
      },
    }),
  }),
});
