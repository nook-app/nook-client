import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Popover, ScrollView, View, XStack, YStack } from "@nook/app-ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useTheme } from "@nook/app/context/theme";
import { LinearGradient } from "@tamagui/linear-gradient";
import { BackButton, IconButton } from "../IconButton";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { memo, useCallback, useState } from "react";
import { TokenMenu } from "@nook/app/features/token/token-menu";
import { Loading } from "@nook/app/components/loading";
import { useImageColors } from "../../hooks/useImageColors";
import { Token } from "@nook/common/types";
import { TokenOverview } from "@nook/app/features/token/token-overview";
import { useToken } from "@nook/app/hooks/useToken";

export default function TokenScreen() {
  const { tokenId } = useLocalSearchParams();
  const { token } = useToken(tokenId as string);
  const insets = useSafeAreaInsets();
  const { rootTheme } = useTheme();
  const paddingBottom = useBottomTabBarHeight();
  const colors = useImageColors(token?.icon?.url, token?.name);

  if (!token || colors.isLoading) return <Loading />;

  return (
    <View flex={1} backgroundColor={"$color1"} paddingTop={insets.top}>
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
      <ScrollView>
        <YStack gap="$4" paddingBottom={paddingBottom + 32}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="$3"
            paddingVertical="$2"
          >
            <BackButton />
            <Menu token={token} />
          </XStack>
          <TokenOverview token={token} color={colors.backgroundColor} />
        </YStack>
      </ScrollView>
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
