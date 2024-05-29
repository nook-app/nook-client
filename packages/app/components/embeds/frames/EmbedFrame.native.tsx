import { ExternalLink } from "@tamagui/lucide-icons";
import { Image } from "expo-image";
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
  TamaguiElement,
} from "@nook/app-ui";
import { ReactNode, forwardRef, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  FarcasterCastResponse,
  FrameButton,
  UrlContentResponse,
} from "@nook/common/types";
import { EnableSignerDialog } from "../../../features/farcaster/enable-signer/dialog";
import { useAuth } from "../../../context/auth";
import { Link } from "../../link";
import { FrameProvider, useFrame } from "./context";
import { TransactionFrameSheet } from "./TransactionFrameSheet.native";

// @ts-ignore: this import is not included in package.json because of version conflicts
import { useWeb3Modal } from "@web3modal/wagmi-react-native";
// @ts-ignore: these imports are not included in package.json because of version conflicts
import { useAccount } from "wagmi";

export const EmbedFrame = ({
  cast,
  content,
}: { cast: FarcasterCastResponse; content: UrlContentResponse }) => {
  if (!content.frame) return null;
  return (
    <FrameProvider cast={cast} url={content.uri} initialFrame={content.frame}>
      <EmbedFrameInner />
    </FrameProvider>
  );
};

export const EmbedFrameInner = () => {
  const {
    host,
    url,
    frame,
    inputText,
    setInputText,
    isLoading,
    topButtons,
    bottomButtons,
    targetUrl,
  } = useFrame();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(isLoading ? 0 : 1, { duration: 500 });
  }, [isLoading, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

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
              <Link href={targetUrl} isExternal={targetUrl.startsWith("http")}>
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
                      index={index + 1}
                      button={button}
                      key={`${button.action}-${index}`}
                    />
                  ))}
                </XStack>
              )}
              {bottomButtons.length > 0 && (
                <XStack gap="$2">
                  {bottomButtons.map((button, index) => (
                    <FrameButtonAction
                      index={index + topButtons.length + 1}
                      button={button}
                      key={`${button.action}-${index}`}
                    />
                  ))}
                </XStack>
              )}
            </YStack>
          </Animated.View>
        </TapGestureHandler>
      </YStack>
      {host && (
        <View alignSelf="flex-end">
          <Link asText href={url}>
            <NookText muted fontWeight="500" fontSize="$3" opacity={0.75}>
              {host.replaceAll("www.", "")}
            </NookText>
          </Link>
        </View>
      )}
    </YStack>
  );
};

const FrameButtonAction = ({
  button,
  index,
}: { button: FrameButton; index: number }) => {
  if (button.action === "tx") {
    return (
      <View flex={1} theme="surface4">
        <TransactionFrameButton button={button} index={index} />
      </View>
    );
  }

  if (button.action === "link") {
    return <LinkFrameButton button={button} index={index} />;
  }

  if (button.action === "mint") {
    return <MintFrameButton button={button} index={index} />;
  }

  return <PostFrameButton button={button} index={index} />;
};

const PostFrameButton = ({
  button,
  index,
}: { button: FrameButton; index: number }) => {
  const { signer } = useAuth();
  const { handlePostAction } = useFrame();

  const label = (
    <>
      {button.label}
      {button.action === "post_redirect" && (
        <ExternalLink size={12} color="$color1" marginLeft="$2" />
      )}
    </>
  );

  if (!signer) {
    return <EnableSignerButton>{label}</EnableSignerButton>;
  }

  return (
    <View flex={1} theme="surface4">
      <FrameActionButton onPress={() => handlePostAction(button, index)}>
        {label}
      </FrameActionButton>
    </View>
  );
};

const LinkFrameButton = ({
  button,
  index,
}: { button: FrameButton; index: number }) => {
  const { signer } = useAuth();
  const { handleNavigateAction } = useFrame();

  const label = (
    <>
      {button.label}
      <ExternalLink size={12} color="$color1" marginLeft="$2" />
    </>
  );

  if (!signer) {
    return <EnableSignerButton>{label}</EnableSignerButton>;
  }

  return (
    <View flex={1} theme="surface4">
      <FrameActionButton
        onPress={() => handleNavigateAction(button.target || "#")}
      >
        {label}
      </FrameActionButton>
    </View>
  );
};

const MintFrameButton = ({
  button,
  index,
}: { button: FrameButton; index: number }) => {
  const { signer } = useAuth();
  const { handleNavigateAction } = useFrame();

  const label = (
    <>
      {button.label}
      <ExternalLink size={12} color="$color1" marginLeft="$2" />
    </>
  );

  if (!signer) {
    return <EnableSignerButton>{label}</EnableSignerButton>;
  }

  return (
    <View flex={1} theme="surface4">
      <FrameActionButton
        onPress={() => handleNavigateAction(button.target || "#")}
      >
        {label}
      </FrameActionButton>
    </View>
  );
};

const TransactionFrameButton = ({
  button,
  index,
}: { button: FrameButton; index: number }) => {
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const { signer } = useAuth();
  const theme = useTheme();

  const label = (
    <>
      <MaterialCommunityIcons
        name="lightning-bolt"
        size={12}
        color={theme.color1.val}
        style={{ marginRight: 4 }}
      />
      {button.label}
    </>
  );

  if (!signer) {
    return <EnableSignerButton>{label}</EnableSignerButton>;
  }

  if (!address) {
    return (
      <View flex={1} theme="surface4">
        <FrameActionButton onPress={open}>{label}</FrameActionButton>
      </View>
    );
  }

  return (
    <View flex={1} theme="surface4">
      <TransactionFrameSheet button={button} index={index}>
        <FrameActionButton>{label}</FrameActionButton>
      </TransactionFrameSheet>
    </View>
  );
};

const EnableSignerButton = ({ children }: { children: ReactNode }) => {
  return (
    <View flex={1} theme="surface4">
      <EnableSignerDialog>
        <FrameActionButton>{children}</FrameActionButton>
      </EnableSignerDialog>
    </View>
  );
};

const FrameActionButton = forwardRef<
  TamaguiElement,
  { children: ReactNode; onPress?: () => void }
>(({ children, onPress }, ref) => (
  <Button
    ref={ref}
    onPress={onPress}
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
      fontWeight="600"
    >
      {children}
    </Text>
  </Button>
));
