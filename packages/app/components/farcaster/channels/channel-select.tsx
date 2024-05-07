import { ReactNode, useState } from "react";
import {
  useRecommendedChannels,
  useSearchChannels,
} from "../../../api/farcaster";
import {
  Input,
  Popover,
  ScrollView,
  Spinner,
  View,
  XStack,
  YStack,
  useDebounceValue,
} from "@nook/ui";
import { FarcasterChannelDisplay } from "./channel-display";
import { X } from "@tamagui/lucide-icons";
import { Channel } from "@nook/common/types";

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

  const { data: recommendedChannels } = useRecommendedChannels();
  const { data: searchedChannels, isLoading } = useSearchChannels(
    debouncedValue,
    10,
  );

  const showSearchResults =
    value &&
    searchedChannels &&
    searchedChannels.pages &&
    searchedChannels.pages.length > 0 &&
    searchedChannels.pages[0].data &&
    searchedChannels.pages[0].data.length > 0;

  return (
    <Popover size="$5" allowFlip open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

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
        <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />

        <ScrollView maxHeight="50vh">
          <YStack>
            <XStack gap="$3" alignItems="center" padding="$3">
              <Input
                value={value}
                onChangeText={setValue}
                placeholder="Search..."
              />
              <View
                cursor="pointer"
                width="$2.5"
                height="$2.5"
                justifyContent="center"
                alignItems="center"
                borderRadius="$10"
                group
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
                <X
                  size={20}
                  opacity={0.4}
                  $group-hover={{
                    color: "$color9",
                    opacity: 1,
                  }}
                />
              </View>
            </XStack>
            {isLoading && (
              <View padding="$4" justifyContent="center" alignItems="center">
                <Spinner color="$color11" size="small" />
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
              ))}
          </YStack>
        </ScrollView>
      </Popover.Content>
    </Popover>
  );
};
