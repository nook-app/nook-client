import { Download, X } from "@tamagui/lucide-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, XStack } from "tamagui";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, ScrollView as RNScrollView } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { IconButton } from "../../../components/IconButton";

export default function ImageModal() {
  const { beforeUrl, url, afterUrl } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const zoomableViewRefs = useRef<(ReactNativeZoomableView | null)[]>([]);
  const scrollViewRef = useRef<RNScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const scrollX = useSharedValue(0);

  const urls = [beforeUrl, url, afterUrl].filter((url) => url) as string[];
  const currentIndex = urls.indexOf(url as string);

  const execAfterZoom = (index: number) =>
    scrollViewRef &&
    zoomableViewRefs.current[index] &&
    // @ts-ignore
    setScrollEnabled(zoomableViewRefs.current[index]?.zoomLevel < 1.01);

  useEffect(() => {
    if (scrollViewRef.current && currentIndex > 0) {
      const offsetX = screenWidth * currentIndex;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: offsetX, animated: false });
      }, 100);
    }
  }, [currentIndex, screenWidth]);

  const DotIndicator = ({
    urls,
    scrollX,
    screenWidth,
  }: { urls: string[]; scrollX: SharedValue<number>; screenWidth: number }) => {
    const navigateToPage = (index: number) => {
      const x = index * screenWidth;
      scrollViewRef.current?.scrollTo({ x, animated: true });
    };

    return (
      <XStack gap="$1.5">
        {urls.map((url, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];
          const scale = useAnimatedStyle(() => {
            const scale = interpolate(
              scrollX.value,
              inputRange,
              [1, 1.5, 1],
              Extrapolation.CLAMP,
            );
            return {
              transform: [{ scale }],
            };
          });
          const opacity = useAnimatedStyle(() => {
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              Extrapolation.CLAMP,
            );
            return { opacity };
          });
          return (
            <TouchableOpacity
              key={url}
              onPress={() => navigateToPage(index)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View
                style={[
                  {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    margin: 4,
                  },
                  scale,
                  opacity,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </XStack>
    );
  };

  const handleDownload = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      try {
        const uri = urls[currentIndex];
        let fileName = uri.split("/").pop();
        if (fileName?.split(".").length === 1) {
          fileName = `${fileName}.jpg`;
        }
        const fileUri = (FileSystem.documentDirectory || "") + fileName;
        await FileSystem.downloadAsync(uri, fileUri);
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);
        Alert.alert("Download Successful!");
      } catch (error) {
        Alert.alert((error as Error).message);
      }
    } else {
      Alert.alert("Permission not granted. Unable to download image.");
    }
  };

  return (
    <View flexGrow={1}>
      <XStack
        position="absolute"
        style={{ paddingTop: insets.top }}
        paddingHorizontal="$2.5"
        zIndex={1000}
        paddingBottom="$2"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <IconButton icon={X} onPress={() => router.back()} />
        <View paddingHorizontal="$2">
          {urls.length > 1 && (
            <DotIndicator
              urls={urls}
              scrollX={scrollX}
              screenWidth={screenWidth}
            />
          )}
        </View>
        <IconButton icon={Download} onPress={handleDownload} />
      </XStack>
      <ScrollView
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {urls.map((url, index) => (
          <ReactNativeZoomableView
            key={url}
            ref={(el) => {
              zoomableViewRefs.current[index] = el;
            }}
            minZoom={1}
            maxZoom={10}
            onZoomAfter={() => execAfterZoom(index)}
            onShiftingEnd={(e, x, y) => {
              if (x.dy > 100 || x.dy < -100) router.back();
              execAfterZoom(index);
              return true;
            }}
            style={{ width: screenWidth, height: "100%" }}
          >
            <Image
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              source={{ uri: url as string }}
            />
          </ReactNativeZoomableView>
        ))}
      </ScrollView>
    </View>
  );
}
