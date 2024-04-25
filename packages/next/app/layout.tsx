import { Metadata } from "next";
import { RootNavigation } from "../components/RootNavigation";
import { Providers } from "./providers";
import { getActiveUser, getServerSession } from "@nook/app/server/auth";

export const metadata: Metadata = {
  title: "nook",
  description:
    "nook is reimagining the way we navigate and experience crypto, onchain and offchain.",
  openGraph: {
    title: "nook",
    description:
      "nook is reimagining the way we navigate and experience crypto, onchain and offchain.",
    images: [
      {
        url: "banner.png",
        width: 1200,
        height: 630,
        alt: "nook",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const [session, user] = await Promise.all([
    getServerSession(),
    getActiveUser(),
  ]);
  return (
    <html lang="en">
      <body
        style={{
          overscrollBehaviorY: "none",
          overscrollBehaviorX: "none",
        }}
      >
        <Providers session={session} user={user}>
          <RootNavigation user={user}>{children}</RootNavigation>
        </Providers>
      </body>
    </html>
  );
}
