import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ContentFeed,
  GetContentRepliesBody,
  GetPanelParams,
  GetPanelQuery,
} from "@flink/api/types";
import { CONFIG } from "@/constants/index";
import * as SecureStore from "expo-secure-store";
import { Session } from "@/context/auth";

const getSecureStoreToken = async () => {
  const { token }: Session = JSON.parse(
    (await SecureStore.getItemAsync("session")) as string,
  );
  return token ? `Bearer ${token}` : "";
};

const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.apiBaseUrl,
  prepareHeaders: async (headers) => {
    const token = await getSecureStoreToken();
    if (token) {
      headers.set("Authorization", token);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (builder) => ({
    getPanel: builder.query<ContentFeed, GetPanelParams & GetPanelQuery>({
      query: (request) => ({
        url: `/nooks/${request.nookId}/shelves/${request.shelfId}/panels/${request.panelId}`,
        method: "GET",
        params: { cursor: request.cursor },
        headers: {},
      }),
    }),
    getContentReplies: builder.query<ContentFeed, GetContentRepliesBody>({
      query: (request) => ({
        url: "/content/replies",
        method: "POST",
        body: request,
      }),
    }),
  }),
});
