import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/utils";
import {
  FarcasterCastResponse,
  FarcasterFeedResponse,
  SignerPublicData,
} from "@nook/api/types";

export const farcasterApi = createApi({
  reducerPath: "farcasterApi",
  baseQuery,
  endpoints: (builder) => ({
    getSigner: builder.query<SignerPublicData, null>({
      query: () => "/farcaster/signer",
    }),
    validateSigner: builder.mutation<{ state: string }, string>({
      query: (token) => `/farcaster/signer/validate?token=${token}`,
    }),
    createCast: builder.mutation<
      { contentId: string },
      { message: string; channel?: string }
    >({
      query: ({ message, channel }) => ({
        url: "/farcaster/cast",
        method: "POST",
        body: { message, channel },
      }),
    }),
    getCast: builder.query<FarcasterCastResponse, string>({
      query: (hash) => `/farcaster/cast/${hash}`,
    }),
    getFeed: builder.query<FarcasterFeedResponse, { feedId: string }>({
      query: (body) => ({
        url: "/farcaster/feed",
        method: "POST",
        body,
      }),
    }),
  }),
});
