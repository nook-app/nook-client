"use server";

import {
  GetSignerResponse,
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
  return session ? JSON.parse(session.value) : undefined;
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
