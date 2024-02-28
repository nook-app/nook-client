import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { FarcasterCastText } from "./FarcasterCastText";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { ChannelDisplay } from "../channel/ChannelDisplay";
import { useEffect, useRef } from "react";
import { ScrollView as RNScrollView, View as RNView } from "react-native";
import { FarcasterCastCompact } from "./FarcasterCastCompact";
import { FarcasterCastReplies } from "./FarcasterCastReplies";
import { FarcasterCastResponse } from "@nook/common/types";

export const FarcasterCast = ({ cast }: { cast: FarcasterCastResponse }) => {
  if (cast.parent) {
    return <FarcasterCastReply cast={cast} />;
  }

  return (
    <ScrollView>
      <FarcasterCastContent cast={cast} />
      <FarcasterCastReplies hash={cast.hash} />
    </ScrollView>
  );
};

const FarcasterCastReply = ({ cast }: { cast: FarcasterCastResponse }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const scrollViewRef = useRef<RNScrollView>(null);
  const scrollTargetRef = useRef<RNView>(null);

  useEffect(() => {
    if (scrollViewRef.current && scrollTargetRef.current) {
      setTimeout(() => {
        scrollTargetRef.current?.measureLayout(
          // @ts-ignore
          scrollViewRef.current,
          (left, top, width, height) => {
            scrollViewRef.current?.scrollTo({
              y: top,
              animated: true,
            });
          },
          (error: Error) => {
            console.error(error);
          },
        );
      }, 300);
    }
  }, []);

  if (!cast.parent) return null;

  return (
    <ScrollView ref={scrollViewRef}>
      <View
        padding="$2"
        borderBottomWidth="0.5"
        borderBottomColor="$borderColor"
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (!cast.parent) return;
            navigation.navigate("FarcasterCast", {
              hash: cast.parent.hash,
            });
          }}
        >
          <FarcasterCastCompact cast={cast.parent} isParent />
        </TouchableWithoutFeedback>
        <FarcasterCastContent cast={cast} />
      </View>
      <FarcasterCastReplies hash={cast.hash} />
    </ScrollView>
  );
};

const FarcasterCastContent = ({ cast }: { cast: FarcasterCastResponse }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <YStack
      padding="$2"
      gap="$3"
      borderBottomColor="$borderColor"
      borderBottomWidth="$0.5"
    >
      <XStack gap="$2">
        <EntityAvatar entityId={cast.entity.id} />
        <EntityDisplay entityId={cast.entity.id} orientation="vertical" />
      </XStack>
      <FarcasterCastText cast={cast} />
      <XStack gap="$1.5" alignItems="center">
        <Text color="$gray11">
          {new Date(cast.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text color="$gray11">{"·"}</Text>
        <Text color="$gray11">
          {new Date(cast.timestamp).toLocaleDateString()}
        </Text>
        {cast.channel && (
          <>
            <Text color="$gray11">{"·"}</Text>
            <ChannelDisplay channel={cast.channel} />
          </>
        )}
      </XStack>
      <XStack gap="$2">
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{cast.engagement.replies}</Text>
          <Text color="$gray11">Replies</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FarcasterCastReposts", {
              hash: cast.hash,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{cast.engagement.recasts}</Text>
            <Text color="$gray11">Recasts</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FarcasterCastQuotes", {
              hash: cast.hash,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{cast.engagement.quotes}</Text>
            <Text color="$gray11">Quotes</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FarcasterCastLikes", {
              hash: cast.hash,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{cast.engagement.likes}</Text>
            <Text color="$gray11">Likes</Text>
          </View>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
};
