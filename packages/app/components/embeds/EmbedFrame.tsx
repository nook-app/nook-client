import { ExternalLink, Zap } from "@tamagui/lucide-icons";
import {
  Spinner,
  Text,
  View,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
} from "@nook/ui";
import { useEffect, useState } from "react";
import { useToastController } from "@tamagui/toast";
import { FarcasterCast, UrlContentResponse } from "../../types";
import { Frame, FrameButton } from "../../types/frames";
import { useAuth } from "../../context/auth";
import { NookButton, NookText, Input, Image } from "@nook/ui";
import { submitFrameAction } from "../../server/farcaster";
import { useRouter } from "solito/navigation";
import { EnableSignerDialog } from "../../features/farcaster/enable-signer/dialog";
import { useTheme } from "../../context/theme";
import { Link } from "solito/link";

export const EmbedFrame = ({
  cast,
  content,
}: { cast?: FarcasterCast; content: UrlContentResponse }) => {
  const toast = useToastController();
  const [frame, setFrame] = useState<Frame | undefined>(content.frame);
  const [inputText, setInputText] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const { session, login, signer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setOpacity(isLoading ? 0 : 1);
  }, [isLoading]);

  if (!frame) return null;

  const topButtons = frame.buttons?.slice(0, 2) || [];
  const bottomButtons = frame.buttons?.slice(2, 4) || [];

  const handleLink = (url: string) => {
    router.push(url);
  };

  const handlePress = async (frameButton: FrameButton, index: number) => {
    if (!frame) return;
    if (!session) {
      login();
      return;
    }

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

  return (
    <YStack gap="$2">
      <YStack
        borderRadius="$4"
        overflow="hidden"
        borderWidth="$0.25"
        borderColor="$borderColor"
      >
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
            >
              <Link
                style={{ position: "relative" }}
                href={content.uri}
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
            backgroundColor="$color3"
            padding="$2"
            gap="$2"
            borderColor="$borderColor"
            borderTopWidth="$0.25"
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
        </View>
      </YStack>
      {content.host && (
        <View alignSelf="flex-end">
          <NookText muted fontSize="$3" opacity={0.75}>
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
  const { theme } = useTheme();
  const tamaguiTheme = useTamaguiTheme();

  const { session, signer } = useAuth();

  if (session && signer?.state !== "completed") {
    return (
      <View flex={1}>
        <EnableSignerDialog>
          <NookButton
            backgroundColor={
              ["light", "dark"].includes(theme) ? "$color12" : "$color7"
            }
            hoverStyle={{
              backgroundColor: ["light", "dark"].includes(theme)
                ? "$color11"
                : "$color8",
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
            }}
            fontWeight="500"
            color="white"
          >
            {button.action === "tx" && (
              <>
                <Zap
                  size={12}
                  color={
                    ["light", "dark"].includes(theme) ? "$color1" : "$color12"
                  }
                  fill={
                    ["light", "dark"].includes(theme)
                      ? tamaguiTheme.color1.val
                      : tamaguiTheme.color12.val
                  }
                />{" "}
              </>
            )}
            {button.label}
            {button.action === "link" ||
            button.action === "post_redirect" ||
            button.action === "mint" ? (
              <>
                {" "}
                <ExternalLink
                  size={12}
                  color={
                    ["light", "dark"].includes(theme) ? "$color1" : "$color12"
                  }
                />
              </>
            ) : null}
          </NookButton>
        </EnableSignerDialog>
      </View>
    );
  }

  return (
    <View flex={1}>
      <NookButton
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPress();
        }}
        backgroundColor={
          ["light", "dark"].includes(theme) ? "$color12" : "$color7"
        }
        hoverStyle={{
          backgroundColor: ["light", "dark"].includes(theme)
            ? "$color11"
            : "$color8",
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
        }}
        fontWeight="500"
        color={["light", "dark"].includes(theme) ? "$color1" : "$color12"}
      >
        {button.action === "tx" && (
          <>
            <Zap
              size={12}
              color={["light", "dark"].includes(theme) ? "$color1" : "$color12"}
              fill={
                ["light", "dark"].includes(theme)
                  ? tamaguiTheme.color1.val
                  : tamaguiTheme.color12.val
              }
            />{" "}
          </>
        )}
        {button.label}
        {button.action === "link" ||
        button.action === "post_redirect" ||
        button.action === "mint" ? (
          <>
            {" "}
            <ExternalLink
              size={12}
              color={["light", "dark"].includes(theme) ? "$color1" : "$color12"}
            />
          </>
        ) : null}
      </NookButton>
    </View>
  );
};
