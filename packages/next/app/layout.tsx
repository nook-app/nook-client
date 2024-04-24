import { Metadata } from "next";
import { RootNavigation } from "../components/RootNavigation";
import { Providers } from "./providers";

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

export default function RootLayout({
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
        <Providers>
          <RootNavigation>{children}</RootNavigation>
        </Providers>
      </body>
    </html>
  );
}
