"use client";

import { FarcasterCastFeed } from "@nook/app/features/farcaster/cast-feed";
import { PageNavigation } from "../components/PageNavigation";
import { UserFilterType } from "@nook/app/types";
import { useAuth } from "@nook/app/context/auth";

export default function Home() {
  const { session } = useAuth();
  return (
    <PageNavigation>
      <FarcasterCastFeed
        filter={{
          users: {
            type: UserFilterType.FOLLOWING,
            data: {
              fid: session?.fid || "3887",
            },
          },
        }}
      />
    </PageNavigation>
  );
}
