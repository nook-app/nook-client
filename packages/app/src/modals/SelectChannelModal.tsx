import { Avatar, Input, Text, View, XStack, YStack } from "tamagui";
import { useState } from "react";
import { FlatList } from "react-native";
import { Channel } from "@nook/common/types";
import { nookApi } from "@/store/apis/nookApi";
import { BottomSheetModal } from "@/components/utils/BottomSheetModal";
import { useAppSelector } from "@/hooks/useAppSelector";

export const SelectChannelModal = ({
  open,
  setOpen,
  channel,
  onChange,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  channel?: Channel;
  onChange: (channel: Channel) => void;
}) => {
  const theme = useAppSelector((state) => state.user.theme);
  const [input, setInput] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);

  const [getSearchResults] = nookApi.useLazySearchChannelsQuery();

  const handleSearch = async (input: string) => {
    setInput(input);
    if (!input) {
      setChannels([]);
      return;
    }

    const { data } = await getSearchResults({ search: input });
    if (data) {
      setChannels(data);
    }
  };

  return (
    <BottomSheetModal
      open={open}
      onClose={() => setOpen(false)}
      snapPoints={["50%", "75%"]}
    >
      <YStack gap="$2" theme={theme} paddingHorizontal="$3">
        <Input value={input} onChangeText={(e) => handleSearch(e)} />
        <Text
          fontWeight="700"
          textTransform="uppercase"
          color="$gray11"
          fontSize="$2"
        >
          results
        </Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={channels}
          keyExtractor={(item) => item.contentId}
          renderItem={({ item }) => (
            <XStack
              alignItems="center"
              gap="$2"
              marginVertical="$2"
              borderWidth={
                channel?.contentId === item.contentId ? "$1" : "$0.25"
              }
              borderColor={
                channel?.contentId === item.contentId
                  ? "$borderColorHover"
                  : "$borderColor"
              }
              backgroundColor={
                channel?.contentId === item.contentId
                  ? "$backgroundPress"
                  : "$background"
              }
              borderRadius="$4"
              padding="$2"
              onPress={() => {
                onChange(item);
              }}
            >
              <Avatar circular size="$3">
                <Avatar.Image src={item.imageUrl} />
                <Avatar.Fallback backgroundColor="$backgroundPress" />
              </Avatar>
              <Text>{item.name}</Text>
            </XStack>
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
        />
      </YStack>
    </BottomSheetModal>
  );
};
