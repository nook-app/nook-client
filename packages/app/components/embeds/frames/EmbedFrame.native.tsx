import { ExternalLink } from "@tamagui/lucide-icons";
import { Image } from "expo-image";
import { Linking } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import {
  Spinner,
  Input,
  Button,
  NookText,
  Text,
  View,
  XStack,
  YStack,
  useTheme,
} from "@nook/app-ui";
import { useEffect, useRef, useState } from "react";
import { useToastController } from "@tamagui/toast";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FarcasterCastResponse,
  Frame,
  FrameButton,
  UrlContentResponse,
} from "@nook/common/types";
import { submitFrameAction } from "../../../api/farcaster/actions";
import { EnableSignerDialog } from "../../../features/farcaster/enable-signer/dialog";
import { useAuth } from "../../../context/auth";
import { CHAINS } from "@nook/common/utils";
import { Link } from "../../link";

export const EmbedFrame = ({
  cast,
  content,
}: { cast?: FarcasterCastResponse; content: UrlContentResponse }) => {
  const toast = useToastController();
  const [frame, setFrame] = useState<Frame | undefined>(content.frame);
  const [inputText, setInputText] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const opacity = useSharedValue(1);
  const frameRef = useRef(content.frame?.image);

  if (frameRef.current !== content.frame?.image) {
    setFrame(content.frame);
    frameRef.current = content.frame?.image;
  }

  useEffect(() => {
    opacity.value = withTiming(isLoading ? 0 : 1, { duration: 500 });
  }, [isLoading, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (!frame) return null;

  const topButtons = frame.buttons?.slice(0, 2) || [];
  const bottomButtons = frame.buttons?.slice(2, 4) || [];

  const handleLink = (url: string) => {
    if (url.includes("warpcast.com/~/add-cast-action")) {
      const params = new URL(url).searchParams;
      router.push({
        pathname: "/~/add-cast-action",
        params: {
          ...Object.fromEntries(params),
        },
      });
    } else {
      Linking.openURL(url);
    }
  };

  const handlePress = async (frameButton: FrameButton, index: number) => {
    if (!frame) return;

    const postUrl = frameButton.target ?? frame.postUrl ?? content.uri;
    if (
      frameButton.action === "post" ||
      frameButton.action === "post_redirect" ||
      !frameButton.action
    ) {
      try {
        setIsLoading(true);
        const response = await submitFrameAction({
          url: content.uri || "",
          castFid: cast?.user.fid || "0",
          castHash: cast?.hash || "0x0000000000000000000000000000000000000000",
          action: frameButton.action,
          buttonIndex: index + 1,
          postUrl: postUrl,
          inputText: inputText,
          state: frame.state,
        });
        if ("message" in response) {
          toast.show(response.message);
        } else if (response.location) {
          handleLink(response.location);
        } else if (response.frame) {
          setFrame(response.frame);
        }
        setInputText(undefined);
      } catch (err) {
        toast.show("Could not fetch frame");
      }
      setIsLoading(false);
    } else if (frameButton.action === "link") {
      handleLink(frameButton.target);
    } else if (frameButton.action === "mint") {
      router.push(frame.postUrl);
    } else if (frameButton.action === "tx") {
      toast.show("Transction frames not supported yet");
    }
  };

  let uri = content.uri;

  const mintAction = frame.buttons?.find((button) => button.action === "mint");
  if (mintAction?.target) {
    const parts = mintAction.target.split(":");
    const chain = CHAINS[`${parts[0]}:${parts[1]}`];
    if (chain?.simplehashId) {
      uri = `/collectibles/${chain.simplehashId}.${parts[2]}.${parts[3]}`;
    }
  }

  return (
    <YStack gap="$2">
      <YStack overflow="hidden">
        <View
          justifyContent="center"
          alignItems="center"
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          {isLoading ? <Spinner /> : null}
        </View>
        <TapGestureHandler>
          <Animated.View style={animatedStyle}>
            {frame.image && (
              <Link href={uri} isExternal={uri.startsWith("http")}>
                <View
                  style={{ position: "relative" }}
                  borderRadius="$4"
                  overflow="hidden"
                >
                  <Image
                    recyclingKey={frame.image}
                    source={{ uri: frame.image }}
                    style={{
                      aspectRatio: frame.imageAspectRatio === "1:1" ? 1 : 1.91,
                    }}
                  />
                </View>
              </Link>
            )}
            <YStack gap="$2" theme="surface1" paddingTop="$2">
              {frame.inputText && (
                <Input
                  value={inputText || ""}
                  onChangeText={setInputText}
                  placeholder={frame.inputText}
                />
              )}
              {topButtons.length > 0 && (
                <XStack gap="$2">
                  {topButtons.map((button, index) => (
                    <FrameButtonAction
                      button={button}
                      onPress={() => handlePress(button, index)}
                      key={`${button.action}-${index}`}
                    />
                  ))}
                </XStack>
              )}
              {bottomButtons.length > 0 && (
                <XStack gap="$2">
                  {bottomButtons.map((button, index) => (
                    <FrameButtonAction
                      button={button}
                      onPress={() => handlePress(button, 2 + index)}
                      key={`${button.action}-${index}`}
                    />
                  ))}
                </XStack>
              )}
            </YStack>
          </Animated.View>
        </TapGestureHandler>
      </YStack>
      {content.host && (
        <View alignSelf="flex-end">
          <NookText muted fontWeight="500" fontSize="$3" opacity={0.75}>
            {content.host.replaceAll("www.", "")}
          </NookText>
        </View>
      )}
    </YStack>
  );
};

const FrameButtonAction = ({
  button,
  onPress,
}: { button: FrameButton; onPress: () => void }) => {
  const theme = useTheme();
  const { signer } = useAuth();

  const Component = (
    <Button
      onPress={signer?.state === "completed" ? onPress : undefined}
      backgroundColor="$color12"
      color="$color1"
      borderWidth="$0"
      hoverStyle={{
        backgroundColor: "$mauve11",
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
      }}
      pressStyle={{
        backgroundColor: "$mauve11",
      }}
      disabledStyle={{
        backgroundColor: "$mauve10",
      }}
    >
      <Text
        alignItems="center"
        gap="$1.5"
        flexShrink={1}
        paddingHorizontal="$1"
        flexWrap="nowrap"
        numberOfLines={2}
        textAlign="center"
        color="$color1"
      >
        {button.action === "tx" && (
          <>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={12}
              color={theme.color1.val}
            />{" "}
          </>
        )}
        <Text textAlign="center" fontWeight="600" color="$color1">
          {button.label}
        </Text>
        {button.action === "link" ||
        button.action === "post_redirect" ||
        button.action === "mint" ? (
          <>
            {" "}
            <ExternalLink size={12} color="$color1" />
          </>
        ) : null}
      </Text>
    </Button>
  );

  if (signer?.state === "completed") {
    return (
      <View flex={1} theme="surface4">
        {Component}
      </View>
    );
  }

  return (
    <View flex={1} theme="surface4">
      <EnableSignerDialog>{Component}</EnableSignerDialog>
    </View>
  );
};
