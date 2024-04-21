"use client";

import { FarcasterCastFeed } from "@nook/app/features/farcaster/cast-feed";
import { PageNavigation } from "components/PageNavigation";

export default function Home() {
  return (
    <PageNavigation>
      <FarcasterCastFeed />
    </PageNavigation>
  );
}
