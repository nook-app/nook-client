import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/utils";
import { SignerPublicData } from "@nook/api/types";

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
    createPost: builder.mutation<
      { contentId: string },
      { message: string; channel?: string }
    >({
      query: ({ message, channel }) => ({
        url: "/farcaster/cast",
        method: "POST",
        body: { message, channel },
      }),
    }),
  }),
});
