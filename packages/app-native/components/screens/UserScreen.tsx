import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { useUser } from "@nook/app/hooks/useUser";
import { useLocalSearchParams } from "expo-router";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { Display, UserFilterType } from "@nook/common/types";
import { NookText, Popover, XStack } from "@nook/app-ui";
import { FarcasterPowerBadge } from "@nook/app/components/farcaster/users/power-badge";
import { TransactionFeedWithGroupSelector } from "@nook/app/features/transactions/transaction-feed";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { Loading } from "@nook/app/components/loading";
import { Link } from "@nook/app/components/link";
import { IconButton } from "../IconButton";
import { Search, MoreHorizontal } from "@tamagui/lucide-icons";
import { FarcasterUserMenu } from "@nook/app/components/farcaster/users/user-menu";
import { formatToCDN } from "@nook/app/utils";

export default function UserScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);

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
      src={user.pfp ? formatToCDN(user.pfp, { width: 168 }) : undefined}
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
            <TransactionFeedWithGroupSelector
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
      right={
        <XStack gap="$2" justifyContent="flex-end">
          <Link
            href={{
              pathname: "/search",
              params: { user: JSON.stringify(user) },
            }}
            unpressable
          >
            <IconButton icon={Search} />
          </Link>
          <FarcasterUserMenu
            user={user}
            trigger={
              <Popover.Trigger asChild>
                <IconButton icon={MoreHorizontal} />
              </Popover.Trigger>
            }
          />
        </XStack>
      }
    />
  );
}
