import { Avatar, Input, Text, XStack, YStack } from "tamagui";
import { memo, useCallback, useState } from "react";
import { FlatList } from "react-native";
import { nookApi } from "@/store/apis/nookApi";
import { useAppSelector } from "@/hooks/useAppSelector";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { Channel } from "@nook/common/prisma/nook";

const ChannelItem = memo(
  ({
    item,
    isActive,
    onPress,
  }: {
    item: Channel;
    isActive: boolean;
    onPress: (channel: Channel) => void;
  }) => {
    return (
      <XStack
        alignItems="center"
        gap="$2"
        marginVertical="$2"
        borderWidth={isActive ? "$1" : "$0.25"}
        borderColor={isActive ? "$borderColorHover" : "$borderColor"}
        backgroundColor={isActive ? "$backgroundPress" : "$background"}
        borderRadius="$4"
        padding="$2"
        onPress={() => onPress(item)}
      >
        <Avatar circular size="$3">
          <Avatar.Image src={item.imageUrl} />
          <Avatar.Fallback backgroundColor="$backgroundPress" />
        </Avatar>
        <Text>{item.name}</Text>
      </XStack>
    );
  },
);
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

  const [getSearchResults] = nookApi.useLazyGetChannelsQuery();

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

  const onPress = useCallback(
    (item: Channel) => {
      onChange(item);
    },
    [onChange],
  );

  if (!open) return null;

  return (
    <BottomSheetModal
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChannelItem
              key={item.id}
              item={item}
              isActive={channel?.id === item.id}
              onPress={onPress}
            />
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
        />
      </YStack>
    </BottomSheetModal>
  );
};
