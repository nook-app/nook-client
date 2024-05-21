import { useLocalSearchParams } from "expo-router";
import { useNft } from "@nook/app/hooks/useNft";
import { ScrollView, Text, View, XStack, YStack } from "@nook/app-ui";
import { EmbedImage } from "@nook/app/components/embeds/EmbedImage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useTheme } from "@nook/app/context/theme";
import { darkenColor } from "@nook/app/utils";
import { LinearGradient } from "@tamagui/linear-gradient";
import { BackButton, IconButton } from "../IconButton";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";

export default function NftScreen() {
  const { nftId } = useLocalSearchParams();
  const { nft } = useNft(nftId as string);
  const insets = useSafeAreaInsets();
  const { rootTheme } = useTheme();
  const paddingBottom = useBottomTabBarHeight();

  if (!nft) return null;

  const backgroundColor = nft.previews.predominant_color || "$color2";
  const darkenedBackgroundColor = nft.previews.predominant_color
    ? darkenColor(backgroundColor)
    : "$color1";

  return (
    <View flex={1} backgroundColor={"$color1"} paddingTop={insets.top}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={[
          darkenedBackgroundColor,
          backgroundColor,
          backgroundColor,
          darkenedBackgroundColor,
        ]}
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
            <IconButton icon={MoreHorizontal} />
          </XStack>
          {nft.previews.image_medium_url && (
            <View
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 0 }}
              shadowOpacity={0.25}
              shadowRadius={10}
              paddingHorizontal="$4"
              alignItems="center"
            >
              <Image
                source={{ uri: nft.previews.image_medium_url }}
                style={{
                  aspectRatio:
                    (nft.image_properties?.width || 1) /
                    (nft.image_properties?.height || 1),
                  width: "100%",
                  maxHeight: 400,
                  borderRadius: 16,
                }}
                placeholder={{ blurhash: nft.previews.blurhash || undefined }}
                placeholderContentFit="cover"
              />
            </View>
          )}
          <YStack paddingHorizontal="$4" gap="$2">
            {nft.name && (
              <Text fontWeight="700" fontSize="$8">
                {nft.name}
              </Text>
            )}
            {nft.description && <Text>{nft.description}</Text>}
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
