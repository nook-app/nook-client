import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  useRecommendedChannels,
  useSearchChannels,
} from "../../../api/farcaster";
import {
  Adapt,
  Input,
  NookText,
  Popover,
  ScrollView,
  Spinner,
  View,
  XStack,
  YStack,
  useDebounceValue,
} from "@nook/app-ui";
import {
  FarcasterChannelAvatar,
  FarcasterChannelDisplay,
} from "./channel-display";
import { X } from "@tamagui/lucide-icons";
import { Channel } from "@nook/common/types";
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { ChannelFollowBadge } from "./channel-follow-badge";
import { FullWindowOverlay } from "react-native-screens";

export const ChannelSelect = ({
  channel,
  setChannel,
  children,
}: {
  channel?: Channel;
  setChannel: (channel?: Channel) => void;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const debouncedValue = useDebounceValue(value, 300);

  useEffect(() => {
    if (open) Keyboard.dismiss();
  }, [open]);

  const containerComponent = useMemo(
    () => (props: { children: ReactNode }) =>
      Platform.OS === "ios" ? (
        <FullWindowOverlay>
          <View f={1} pe="box-none">
            {props.children}
          </View>
        </FullWindowOverlay>
      ) : (
        props.children
      ),
    [],
  );

  return (
    <Popover size="$5" allowFlip open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Popover.Sheet
          modal
          dismissOnSnapToBottom
          animation="100ms"
          containerComponent={containerComponent}
        >
          <Popover.Sheet.Overlay
            animation="quick"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Popover.Sheet.Frame
            paddingBottom="$8"
            paddingTop="$2"
            backgroundColor="$color2"
          >
            <ChannelInput
              value={value}
              setValue={setValue}
              setChannel={setChannel}
              setOpen={setOpen}
            />
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={180}
            >
              <Popover.Sheet.ScrollView keyboardShouldPersistTaps="handled">
                <ChannelResults
                  value={value}
                  setChannel={setChannel}
                  setOpen={setOpen}
                />
              </Popover.Sheet.ScrollView>
            </KeyboardAvoidingView>
          </Popover.Sheet.Frame>
        </Popover.Sheet>
      </Adapt>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColorBg"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
      >
        <ChannelInput
          value={value}
          setValue={setValue}
          setChannel={setChannel}
          setOpen={setOpen}
        />
        <ScrollView
          $platform-web={{ maxHeight: "50vh" }}
          keyboardShouldPersistTaps="handled"
        >
          <ChannelResults
            value={debouncedValue}
            setChannel={setChannel}
            setOpen={setOpen}
          />
        </ScrollView>
      </Popover.Content>
    </Popover>
  );
};

const ChannelInput = ({
  value,
  setValue,
  setChannel,
  setOpen,
}: {
  value: string;
  setValue: (value: string) => void;
  setChannel: (channel?: Channel) => void;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <XStack gap="$2" alignItems="center" padding="$3" theme="surface2">
      <Input
        value={value}
        onChangeText={setValue}
        placeholder="Search..."
        flexGrow={1}
      />
      <View
        cursor="pointer"
        width="$2.5"
        height="$2.5"
        justifyContent="center"
        alignItems="center"
        borderRadius="$10"
        hoverStyle={{
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
          backgroundColor: "$color3",
        }}
        onPress={() => {
          setChannel(undefined);
          setOpen(false);
        }}
      >
        <X size={20} />
      </View>
    </XStack>
  );
};

const ChannelResults = ({
  value,
  setChannel,
  setOpen,
}: {
  value: string;
  setChannel: (channel?: Channel) => void;
  setOpen: (open: boolean) => void;
}) => {
  const { data: recommendedChannels } = useRecommendedChannels();
  const { data: searchedChannels, isLoading } = useSearchChannels(value, 10);

  const showSearchResults =
    value &&
    searchedChannels &&
    searchedChannels.pages &&
    searchedChannels.pages.length > 0 &&
    searchedChannels.pages[0].data &&
    searchedChannels.pages[0].data.length > 0;

  return (
    <YStack>
      {isLoading && (
        <View padding="$4" justifyContent="center" alignItems="center">
          <Spinner size="small" />
        </View>
      )}
      {showSearchResults &&
        !isLoading &&
        searchedChannels?.pages.map((page) =>
          page.data.map((channel) => (
            <View
              key={channel.channelId}
              padding="$3"
              hoverStyle={{
                backgroundColor: "$color4",
                // @ts-ignore
                transition: "all 0.2s ease-in",
              }}
              cursor="pointer"
              onPress={() => {
                setChannel(channel);
                setOpen(false);
              }}
            >
              <FarcasterChannelDisplay channel={channel} />
            </View>
          )),
        )}
      {!showSearchResults &&
        !isLoading &&
        recommendedChannels?.data.map((channel) => (
          <View
            key={channel.channelId}
            hoverStyle={{
              backgroundColor: "$color4",
              // @ts-ignore
              transition: "all 0.2s ease-in",
            }}
            cursor="pointer"
            onPress={() => {
              setChannel(channel);
              setOpen(false);
            }}
          >
            <XStack
              gap="$2.5"
              padding="$2.5"
              hoverStyle={{
                transform: "all 0.2s ease-in-out",
                backgroundColor: "$color2",
              }}
            >
              <FarcasterChannelAvatar channel={channel} size="$4" />
              <YStack flexShrink={1} gap="$1" flexGrow={1}>
                <XStack justifyContent="space-between">
                  <YStack gap="$1">
                    <NookText
                      fontWeight="700"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {channel.name}
                    </NookText>
                    <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                      <NookText
                        muted
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        flexShrink={1}
                      >
                        {`/${channel.channelId}`}
                      </NookText>
                      <ChannelFollowBadge channel={channel} />
                    </XStack>
                  </YStack>
                </XStack>
              </YStack>
            </XStack>
          </View>
        ))}
    </YStack>
  );
};
