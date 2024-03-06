import { createApi } from "@reduxjs/toolkit/query/react";
import { GetUserResponse } from "@nook/api/types";
import { baseQuery } from "@/store/utils";
import { Session } from "@/utils/session";

export type SignInParams = {
  message: string;
  nonce: string;
  signature: string;
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  endpoints: (builder) => ({
    getUser: builder.query<GetUserResponse, null>({
      query: () => "/user",
    }),
    loginUser: builder.mutation<Session, SignInParams>({
      query: (params) => ({
        url: "/user/login",
        method: "POST",
        body: params,
      }),
    }),
  }),
});
