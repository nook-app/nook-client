"use client";

import { FarcasterCastFeed } from "@nook/app/features/farcaster/cast-feed";
import { UserFilterType } from "@nook/common/types";
import { PageNavigation } from "components/PageNavigation";

export default function Home() {
  return (
    <PageNavigation>
      <FarcasterCastFeed
        filter={{
          users: {
            type: UserFilterType.FOLLOWING,
            data: {
              fid: "3887",
            },
          },
        }}
      />
    </PageNavigation>
  );
}
