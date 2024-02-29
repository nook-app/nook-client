import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/utils";
import {
  FarcasterFeedRequest,
  FarcasterFeedResponse,
  SignerPublicData,
} from "@nook/api/types";
import { FarcasterCastResponseWithContext } from "@nook/common/types";

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
        url: "/farcaster/casts",
        method: "POST",
        body: { message, channel },
      }),
    }),
    getCast: builder.query<FarcasterCastResponseWithContext, string>({
      query: (hash) => `/farcaster/casts/${hash}`,
    }),
    getCastReplies: builder.query<FarcasterFeedResponse, string>({
      query: (hash) => `/farcaster/casts/${hash}/replies`,
    }),
    getFeed: builder.query<FarcasterFeedResponse, FarcasterFeedRequest>({
      query: (body) => ({
        url: "/farcaster/feed",
        method: "POST",
        body,
      }),
    }),
  }),
});
