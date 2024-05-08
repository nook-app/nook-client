"use server";

import { Session } from "@nook/common/types";
import { cookies } from "next/headers";

export async function updateServerSession(session: Session) {
  cookies().set("session", JSON.stringify(session), { secure: true });
}

export async function deleteServerSession() {
  cookies().delete("session");
}

export async function getServerSession(): Promise<Session | undefined> {
  const session = cookies().get("session");
  return session?.value ? JSON.parse(session.value) : undefined;
}
