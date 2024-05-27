import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Button, NookText, Popover, Text, View, XStack } from "@nook/app-ui";
import { BlurView } from "expo-blur";
import { useTheme } from "@nook/app/context/theme";
import { LinearGradient } from "@tamagui/linear-gradient";
import { IconButton } from "../IconButton";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { memo, useCallback, useState } from "react";
import { TokenMenu } from "@nook/app/features/token/token-menu";
import { Loading } from "@nook/app/components/loading";
import { useImageColors } from "../../hooks/useImageColors";
import { Token } from "@nook/common/types";
import {
  TokenDescription,
  TokenOverview,
} from "@nook/app/features/token/token-overview";
import { useToken } from "@nook/app/hooks/useToken";
import {
  TokenTransactionsFeed,
  TokenTransactionsFeedHeader,
  TokenTransactionsFeedViewer,
} from "@nook/app/features/token/token-transactions";
import { CollapsibleGradientLayout } from "../CollapsibleGradientLayout";
import { Tabs } from "react-native-collapsible-tab-view";
import { useAuth } from "@nook/app/context/auth";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";
import {
  FarcasterTokenHolders,
  FarcasterTokenHoldersHeader,
} from "@nook/app/features/token/token-holders";

export default function TokenScreen() {
  const { session } = useAuth();
  const { tokenId } = useLocalSearchParams();
  const { token } = useToken(tokenId as string);
  const { rootTheme } = useTheme();
  const paddingBottom = useBottomTabBarHeight();
  const colors = useImageColors(token?.icon?.url, token?.name);

  const chains = token?.instances.map((instance) => instance.chainId);
  const holderInfoChains = SIMPLEHASH_CHAINS.filter(
    (chain) => chain.simplehashFungibles,
  ).map((chain) => chain.id);
  const hasHolderInfo =
    token?.id !== "eth" &&
    chains?.some((chain) => holderInfoChains.includes(chain));

  if (!token || colors.isLoading) return <Loading />;

  const tabs = [];
  if (hasHolderInfo) {
    tabs.push({
      name: "Holders",
      component: (
        <FarcasterTokenHolders
          token={token}
          asTabs
          paddingBottom={paddingBottom}
          ListHeaderComponent={<FarcasterTokenHoldersHeader token={token} />}
        />
      ),
    });
  }

  if (session?.fid) {
    tabs.push({
      name: "Activity",
      component: (
        <TokenTransactionsFeedViewer
          token={token}
          paddingBottom={paddingBottom}
        />
      ),
    });
  }

  if (token.description) {
    tabs.push({
      name: "About",
      component: (
        <Tabs.ScrollView>
          <TokenDescription token={token} />
        </Tabs.ScrollView>
      ),
    });
  }

  return (
    <View flex={1}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={[colors.backgroundColor, colors.primaryColor]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flex: 1,
        }}
      />
      <BlurView
        intensity={100}
        tint={rootTheme}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flex: 1,
        }}
      />
      <CollapsibleGradientLayout
        title={<Title token={token} />}
        src={token.icon?.url}
        fallbackSrc={token.name}
        header={<TokenOverview token={token} color={colors.backgroundColor} />}
        pages={tabs}
        right={<Menu token={token} />}
      />
    </View>
  );
}

const Menu = memo(({ token }: { token: Token }) => {
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(useCallback(() => setShowMenu(true), []));

  return (
    <XStack gap="$2" justifyContent="flex-end">
      {showMenu ? (
        <TokenMenu
          token={token}
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

const Title = memo(({ token }: { token: Token }) => {
  return (
    <XStack alignItems="center" gap="$2" flexShrink={1}>
      <NookText
        fontSize="$5"
        fontWeight="700"
        ellipsizeMode="tail"
        numberOfLines={1}
        flexShrink={1}
      >
        {token.name}
      </NookText>
    </XStack>
  );
});
