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
    createCast: builder.mutation<
      { hash: string },
      { message: string; channel?: string }
    >({
      query: ({ message, channel }) => ({
        url: "/farcaster/casts",
        method: "POST",
        body: { message, channel },
      }),
    }),
    deleteCast: builder.mutation<{ hash: string }, { hash: string }>({
      query: ({ hash }) => ({
        url: `/farcaster/casts/${hash}`,
        method: "DELETE",
      }),
    }),
    likeCast: builder.mutation<{ hash: string }, { hash: string }>({
      query: ({ hash }) => ({
        url: `/farcaster/casts/${hash}/likes`,
        method: "POST",
      }),
    }),
    unlikeCast: builder.mutation<{ hash: string }, { hash: string }>({
      query: ({ hash }) => ({
        url: `/farcaster/casts/${hash}/likes`,
        method: "DELETE",
      }),
    }),
    recastCast: builder.mutation<{ hash: string }, { hash: string }>({
      query: ({ hash }) => ({
        url: `/farcaster/casts/${hash}/recasts`,
        method: "POST",
      }),
    }),
    unrecastCast: builder.mutation<{ hash: string }, { hash: string }>({
      query: ({ hash }) => ({
        url: `/farcaster/casts/${hash}/recasts`,
        method: "DELETE",
      }),
    }),
    followUser: builder.mutation<{ id: string }, { fid: string }>({
      query: ({ fid }) => ({
        url: `/farcaster/users/${fid}/followers`,
        method: "POST",
      }),
    }),
    unfollowUser: builder.mutation<{ id: string }, { fid: string }>({
      query: ({ fid }) => ({
        url: `/farcaster/users/${fid}/followers`,
        method: "DELETE",
      }),
    }),
  }),
});
