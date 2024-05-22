"use client";

import { fetchNft } from "@nook/app/api/nft";
import { ZoomableImage } from "@nook/app/components/zoomable-image";
import { View, YStack } from "@nook/app-ui";
import { darkenColor } from "@nook/app/utils";
import {
  NftOverview,
  NftProperties,
  NftProvenance,
} from "@nook/app/features/nft/nft-overview";
import { LinearGradient } from "@tamagui/linear-gradient";

export default async function Home({ params }: { params: { nftId: string } }) {
  const nft = await fetchNft(params.nftId);

  const backgroundColor = nft.previews.predominant_color || "$color2";
  const darkenedBackgroundColor = nft.previews.predominant_color
    ? darkenColor(backgroundColor)
    : "$color1";

  return (
    <YStack gap="$4" paddingBottom="$4">
      {nft.previews.image_medium_url && (
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          colors={[backgroundColor, darkenedBackgroundColor]}
          paddingVertical="$4"
        >
          <ZoomableImage uri={nft.previews.image_medium_url}>
            <View marginHorizontal="$2.5" alignItems="center">
              <View
                shadowColor="$shadowColor"
                shadowOffset={{ width: 0, height: 0 }}
                shadowOpacity={0.5}
                shadowRadius={10}
                backgroundColor={backgroundColor}
                borderRadius="$4"
              >
                <View borderRadius="$4" overflow="hidden">
                  <img
                    src={nft.previews.image_medium_url}
                    style={{
                      aspectRatio:
                        (nft.image_properties?.width || 1) /
                        (nft.image_properties?.height || 1),
                      width: "100%",
                      maxHeight: 400,
                    }}
                    alt={nft.name}
                  />
                </View>
              </View>
            </View>
          </ZoomableImage>
        </LinearGradient>
      )}
      <YStack paddingHorizontal="$2.5" gap="$6">
        <NftOverview nft={nft} />
        <NftProperties nft={nft} />
        <NftProvenance nft={nft} />
      </YStack>
    </YStack>
  );
}
