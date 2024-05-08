import "@tamagui/core/reset.css";

import { Metadata } from "next";
import { RootNavigation } from "../components/RootNavigation";
import { Providers } from "./providers";
import { getServerSession } from "@nook/app/server/session";
import { getSigner } from "@nook/app/server/auth";
import { ReactNode } from "react";
import { fetchUser } from "@nook/app/api/farcaster";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL("https://nook.social"),
  title: "nook",
  description:
    "nook is reimagining the way we navigate and experience crypto, onchain and offchain.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "nook",
    description:
      "nook is reimagining the way we navigate and experience crypto, onchain and offchain.",
    type: "website",
    locale: "en_US",
    url: "https://nook.social",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "nook",
      },
    ],
  },
  manifest: "/manifest.json",
};

export async function generateViewport() {
  const session = await getServerSession();
  let themeColor;
  switch (session?.theme) {
    case "dark":
      themeColor = "#000000";
      break;
    case "mauve":
      themeColor = "#161618";
      break;
    case "red":
      themeColor = "#1f1315";
      break;
    case "orange":
      themeColor = "#1f1206";
      break;
    case "yellow":
      themeColor = "#1c1500";
      break;
    case "green":
      themeColor = "#0d1912";
      break;
    case "blue":
      themeColor = "#0f1720";
      break;
    case "purple":
      themeColor = "#1b141d";
      break;
    default:
      themeColor = "#1f121b";
  }
  return { themeColor };
}

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          overscrollBehaviorY: "none",
          overscrollBehaviorX: "none",
        }}
      >
        <Component>{children}</Component>
      </body>
    </html>
  );
}

async function Component({ children }: { children: ReactNode }) {
  const [session] = await Promise.all([getServerSession()]);

  const host = headers().get("host");
  const subdomain = host?.split(".")[0];

  if (!session) {
    return (
      <Providers nook={subdomain}>
        <RootNavigation>{children}</RootNavigation>
      </Providers>
    );
  }

  const [user, signer] = await Promise.all([
    fetchUser(session.fid),
    getSigner(),
  ]);

  return (
    <Providers session={session} user={user} signer={signer} nook={subdomain}>
      <RootNavigation>{children}</RootNavigation>
    </Providers>
  );
}
