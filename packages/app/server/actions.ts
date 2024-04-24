"use server";

import { FarcasterUser, Session } from "@nook/app/types";
import { cookies } from "next/headers";

export async function loginServer(session: Session) {
  "use server";

  cookies().set("session", JSON.stringify(session), { secure: true });
}

export async function logoutServer() {
  "use server";

  cookies().delete("session");
}

export async function getServerSession(): Promise<Session | undefined> {
  "use server";

  const session = cookies().get("session");
  return session ? JSON.parse(session.value) : undefined;
}

export async function setActiveUser(user: FarcasterUser | undefined) {
  "use server";

  if (!user) {
    cookies().delete("user");
    return;
  }

  cookies().set("user", JSON.stringify(user), { secure: true });
}

export async function getActiveUser(): Promise<FarcasterUser | undefined> {
  "use server";

  const user = cookies().get("user");
  return user ? JSON.parse(user.value) : undefined;
}
