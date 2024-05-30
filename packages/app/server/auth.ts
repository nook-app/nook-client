"use server";

import {
  FarcasterUserV1,
  GetSignerResponse,
  PendingSignerResponse,
  Session,
  ValidateSignerResponse,
} from "@nook/common/types";
import { cookies } from "next/headers";
import { makeRequest } from "../api/utils";

export const loginUser = async (
  token: string,
): Promise<Session & { signer: GetSignerResponse }> => {
  return await makeRequest("/user/login/privy", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSigner = async (): Promise<GetSignerResponse> => {
  return await makeRequest("/signer");
};

export const validateSigner = async (
  token: string,
): Promise<ValidateSignerResponse> => {
  return await makeRequest(`/signer/validate?token=${token}`);
};

export const validateSignerByPublicKey = async (
  publicKey: string,
): Promise<ValidateSignerResponse> => {
  return await makeRequest(`/signer/validate?publicKey=${publicKey}`);
};

export const getPendingSigner = async (
  address: string,
): Promise<PendingSignerResponse> => {
  return await makeRequest(`/signer/${address}`);
};

export const updateUser = async (user: FarcasterUserV1) => {
  cookies().set("user", JSON.stringify(user), { secure: true });
};

export const getUser = async (): Promise<FarcasterUserV1 | undefined> => {
  const user = cookies().get("user");
  return user?.value ? JSON.parse(user.value) : undefined;
};

export const updateSigner = async (signer: GetSignerResponse) => {
  cookies().set("signer", JSON.stringify(signer), { secure: true });
};

export const getSignerFromStorage = async (): Promise<
  GetSignerResponse | undefined
> => {
  const signer = cookies().get("signer");
  return signer?.value ? JSON.parse(signer.value) : undefined;
};
