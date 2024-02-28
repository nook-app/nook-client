import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/store/utils";
import { Channel } from "@nook/common/prisma/nook";
import { NookResponse } from "@nook/common/types";

export const nookApi = createApi({
  reducerPath: "nookApi",
  baseQuery,
  endpoints: (builder) => ({
    getNook: builder.query<NookResponse, string>({
      query: (nookId) => `/nooks/${nookId}`,
    }),
    getChannels: builder.query<Channel[], null>({
      query: () => "/channels",
    }),
    getChannel: builder.query<Channel, string>({
      query: (channelId) => `/channels/${channelId}`,
    }),
  }),
});
