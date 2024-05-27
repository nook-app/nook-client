import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { useUser } from "@nook/app/hooks/useUser";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { Display, FarcasterUser, UserFilterType } from "@nook/common/types";
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
import { memo, useCallback, useState } from "react";
import { NftFeed } from "@nook/app/features/nft/nft-feed";
import { TokenHoldings } from "@nook/app/features/token/token-holdings";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function UserScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useUser(username as string);
  const paddingBottom = useBottomTabBarHeight();

  if (!user) return <Loading />;

  return (
    <CollapsibleGradientLayout
      title={<Title user={user} />}
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
              paddingBottom={paddingBottom}
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
              paddingBottom={paddingBottom}
              asTabs
            />
          ),
        },
        {
          name: "Collectibles",
          component: (
            <NftFeed
              filter={{
                users: {
                  type: UserFilterType.FID,
                  data: {
                    fid: user.fid,
                  },
                },
              }}
              paddingBottom={paddingBottom}
              asTabs
            />
          ),
        },
        {
          name: "Tokens",
          component: (
            <TokenHoldings
              filter={{
                fid: user.fid,
              }}
              paddingBottom={paddingBottom}
              asTabs
            />
          ),
        },
        {
          name: "Activity",
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
              paddingBottom={paddingBottom}
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
              paddingBottom={paddingBottom}
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
              paddingBottom={paddingBottom}
              asTabs
            />
          ),
        },
      ]}
      right={<Menu user={user} />}
    />
  );
}

const Menu = memo(({ user }: { user: FarcasterUser }) => {
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(useCallback(() => setShowMenu(true), []));

  return (
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
      {showMenu ? (
        <FarcasterUserMenu
          user={user}
          trigger={
            <Popover.Trigger asChild>
              <IconButton icon={MoreHorizontal} />
            </Popover.Trigger>
          }
        />
      ) : (
        <IconButton icon={MoreHorizontal} />
      )}
    </XStack>
  );
});

const Title = memo(({ user }: { user: FarcasterUser }) => {
  return (
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
  );
});
