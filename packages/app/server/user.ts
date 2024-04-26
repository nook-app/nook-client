"use server";

import { ThemeName } from "@nook/ui";
import { makeRequest } from "../api/utils";
import { cookies } from "next/headers";

export const updateTheme = async (theme: ThemeName) => {
  const resonse = await makeRequest("/user", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ theme }),
  });

  const session = cookies().get("session");
  if (session?.value) {
    cookies().set(
      "session",
      JSON.stringify({ ...JSON.parse(session.value), theme }),
      {
        secure: true,
      },
    );
  }

  return resonse;
};
