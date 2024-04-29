"use server";

import {
  FarcasterUser,
  GetSignerResponse,
  PendingSignerResponse,
  Session,
  ValidateSignerResponse,
} from "@nook/app/types";
import { cookies } from "next/headers";
import { makeRequest } from "../api/utils";

export async function loginServer(session: Session) {
  cookies().set("session", JSON.stringify(session), { secure: true });
}

export async function logoutServer() {
  cookies().delete("session");
}

export async function getServerSession(): Promise<Session | undefined> {
  const session = cookies().get("session");
  return session?.value ? JSON.parse(session.value) : undefined;
}

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

export const getPendingSigner = async (
  address: string,
): Promise<PendingSignerResponse> => {
  return await makeRequest(`/signer/${address}`);
};

export const updateUser = async (user: FarcasterUser) => {
  cookies().set("user", JSON.stringify(user), { secure: true });
};

export const getUser = async (): Promise<FarcasterUser | undefined> => {
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
