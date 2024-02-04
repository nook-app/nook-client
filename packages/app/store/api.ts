import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FeedItem, GetFeedRequest, GetFeedResponse } from "@flink/api/types";
import { API_BASE_URL } from "../constants";
import { EventActionData } from "@flink/common/types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getFeedForFilter: builder.query<
      FeedItem<EventActionData>[],
      GetFeedRequest
    >({
      query: (request) => {
        return {
          url: "/feeds",
          method: "POST",
          body: request,
        };
      },
      transformResponse: (response: GetFeedResponse) => response.data,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return { endpointName, filter: queryArgs.filter };
      },
      merge: (currentCache, newItems) => {
        currentCache.push(...newItems);
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
  }),
});
