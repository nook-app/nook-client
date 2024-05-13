import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { Display, UserFilterType } from "@nook/common/types";
import { NookText, XStack } from "@nook/app-ui";
import { FarcasterPowerBadge } from "@nook/app/components/farcaster/users/power-badge";
import { formatToCDN } from "@nook/app/utils";
import { TransactionFeed } from "@nook/app/features/transactions/transaction-feed";
import { useImageColors } from "../../../../hooks/useImageColors";
import { CollapsibleGradientLayout } from "../../../../components/CollapsibleGradientLayout";
import { useAuth } from "@nook/app/context/auth";

export default function ProfileScreen() {
  const { user } = useAuth();

  const colors = useImageColors(
    user?.pfp ? formatToCDN(user.pfp, { width: 168 }) : undefined,
  );

  if (!user) return null;

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
            {user.displayName || user.username}
          </NookText>
          <FarcasterPowerBadge badge={user.badges?.powerBadge ?? false} />
        </XStack>
      }
      colors={colors}
      header={<UserHeader user={user} size="$6" disableMenu />}
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
            <TransactionFeed
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
