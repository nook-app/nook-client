import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GetFeedRequest, GetFeedResponse } from "@flink/api/types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  // baseQuery: fetchBaseQuery({ baseUrl: "https://flink-api.up.railway.app" }),
  endpoints: (builder) => ({
    getFeedForFilter: builder.query<GetFeedResponse, GetFeedRequest>({
      query: (request) => ({
        url: "/feeds",
        method: "POST",
        body: request,
      }),
    }),
  }),
});
