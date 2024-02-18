import { CONFIG } from "@/constants";
import { Session, getSession } from "../session";
import { SignerPublicData } from "@flink/api/types";

export const getFarcasterSigner = async (session: Session) => {
  const response = await fetch(`${CONFIG.apiBaseUrl}/farcaster/signer`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as SignerPublicData;
};

export const validateFarcasterSigner = async (
  session: Session,
  token: string,
) => {
  const response = await fetch(
    `${CONFIG.apiBaseUrl}/farcaster/signer/validate?token=${token}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as { state: string };
};

export const createFarcasterPost = async (
  message: string,
  channel?: string,
) => {
  const session = await getSession();
  if (!session) {
    throw new Error("No active session");
  }

  const response = await fetch(`${CONFIG.apiBaseUrl}/farcaster/cast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ message, channel }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as { contentId: string };
};
