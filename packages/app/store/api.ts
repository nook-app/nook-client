import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GetFeedRequest, GetFeedResponse } from "@flink/api/types";
import { API_BASE_URL } from "../constants";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
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
