import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { useUser } from "@nook/app/hooks/useUser";
import { useLocalSearchParams } from "expo-router";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { Display, UserFilterType } from "@nook/common/types";
import { NookText, XStack } from "@nook/app-ui";
import { FarcasterPowerBadge } from "@nook/app/components/farcaster/users/power-badge";
import { formatToCDN } from "@nook/app/utils";
import { TransactionFeedWithChainSelector } from "@nook/app/features/transactions/transaction-feed";
import { useImageColors } from "../../hooks/useImageColors";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { Loading } from "@nook/app/components/loading";

export default function UserScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);

  const colors = useImageColors(
    user?.pfp ? formatToCDN(user.pfp, { width: 168 }) : undefined,
  );

  if (!user) return <Loading />;

  return (
    <CollapsibleGradientLayout
      title={
        <XStack alignItems="center" gap="$2" flexShrink={1}>
          <NookText
            fontSize="$5"
            fontWeight="700"
            ellipsizeMode="tail"
            numberOfLines={1}
            flexShrink={1}
          >
            {user.displayName || username}
          </NookText>
          <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
        </XStack>
      }
      colors={colors}
      header={<UserHeader user={user} size="$6" />}
      pages={[
        {
          name: "Casts",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.FIDS,
                  data: {
                    fids: [user.fid],
                  },
                },
              }}
              asTabs
            />
          ),
        },
        {
          name: "Replies",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.FIDS,
                  data: {
                    fids: [user.fid],
                  },
                },
                onlyReplies: true,
              }}
              asTabs
            />
          ),
        },
        {
          name: "Transactions",
          component: (
            <TransactionFeedWithChainSelector
              filter={{
                users: {
                  type: UserFilterType.FIDS,
                  data: {
                    fids: [user.fid],
                  },
                },
              }}
              asTabs
            />
          ),
        },
        {
          name: "Media",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.FIDS,
                  data: {
                    fids: [user.fid],
                  },
                },
                contentTypes: ["image"],
              }}
              displayMode={Display.GRID}
              asTabs
            />
          ),
        },
        {
          name: "Frames",
          component: (
            <FarcasterFilteredFeed
              filter={{
                users: {
                  type: UserFilterType.FIDS,
                  data: {
                    fids: [user.fid],
                  },
                },
                onlyFrames: true,
              }}
              displayMode={Display.FRAMES}
              asTabs
            />
          ),
        },
      ]}
    />
  );
}
