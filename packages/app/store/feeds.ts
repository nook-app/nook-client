import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FeedResponse } from "@flink/api/types";

export const feeds = createApi({
  reducerPath: "feeds",
  baseQuery: fetchBaseQuery({ baseUrl: "https://flink-api.up.railway.app" }),
  endpoints: (builder) => ({
    getFeeds: builder.query<FeedResponse, object>({
      query: () => ({
        url: "/feeds",
        method: "POST",
        body: {
          filter: {
            type: "POST",
          },
        },
      }),
    }),
  }),
});
