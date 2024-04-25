"use server";

import { FarcasterUser, Session } from "@nook/app/types";
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

export async function setActiveUser(user: FarcasterUser | undefined) {
  if (!user) {
    cookies().delete("user");
    return;
  }

  cookies().set("user", JSON.stringify(user), { secure: true });
}

export async function getActiveUser(): Promise<FarcasterUser | undefined> {
  const user = cookies().get("user")?.value;
  return user ? JSON.parse(user) : undefined;
}

export const loginUser = async (token: string): Promise<Session> => {
  return await makeRequest("/user/login/privy", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
