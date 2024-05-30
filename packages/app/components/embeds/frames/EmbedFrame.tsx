import { ExternalLink, Zap } from "@tamagui/lucide-icons";
import {
  Button,
  Spinner,
  TamaguiElement,
  Text,
  View,
  XStack,
  YStack,
  useTheme,
} from "@nook/app-ui";
import { ReactNode, forwardRef, useEffect, useState } from "react";
import { FarcasterCastV1, UrlContentResponse } from "@nook/common/types";
import { FrameButton } from "@nook/common/types";
import { useAuth } from "../../../context/auth";
import { NookText, Input, Image } from "@nook/app-ui";
import { EnableSignerDialog } from "../../../features/farcaster/enable-signer/dialog";
import { Link } from "solito/link";
import { FrameProvider, useFrame } from "./context";
import { WagmiProvider, useAccount } from "wagmi2";
import { wagmiConfig } from "../../../utils/wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { TransactionFrameSheet } from "./TransactionFrameSheet";

export const EmbedFrame = ({
  cast,
  content,
}: { cast?: FarcasterCastV1; content: UrlContentResponse }) => {
  if (!content.frame) return null;
  return (
    <WagmiProvider config={wagmiConfig}>
      <FrameProvider cast={cast} url={content.uri} initialFrame={content.frame}>
        <EmbedFrameInner />
      </FrameProvider>
    </WagmiProvider>
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
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    setOpacity(isLoading ? 0 : 1);
  }, [isLoading]);

  if (!frame) return null;

  return (
    <YStack gap="$2">
      <YStack overflow="hidden">
        <View
          backgroundColor="$color2"
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
        <View
          style={{
            opacity,
            transition: "all 0.5s ease-in-out",
          }}
        >
          {frame.image && (
            <View
              onPress={(e) => {
                e.stopPropagation();
              }}
              borderRadius="$4"
              overflow="hidden"
            >
              <Link
                style={{ position: "relative" }}
                href={targetUrl}
                target="_blank"
              >
                <Image
                  source={{ uri: frame.image }}
                  style={{
                    aspectRatio: frame.imageAspectRatio === "1:1" ? 1 : 1.91,
                  }}
                />
              </Link>
            </View>
          )}
          <YStack
            paddingTop="$2"
            gap="$2"
            theme="surface1"
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
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
        </View>
      </YStack>
      {host && (
        <View alignSelf="flex-end">
          <NookText muted fontWeight="500" fontSize="$3" opacity={0.75}>
            {host.replaceAll("www.", "")}
          </NookText>
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
  const { signer } = useAuth();
  const theme = useTheme();
  const { address } = useAccount();
  const { connectWallet } = usePrivy();

  const label = (
    <>
      <Zap
        size={12}
        color={theme.color1.val}
        fill={theme.color1.val}
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
        <FrameActionButton onPress={connectWallet}>{label}</FrameActionButton>
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
