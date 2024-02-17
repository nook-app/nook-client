import { Avatar, Input, Sheet, Text, XStack, YStack } from "tamagui";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { CHANNELS_LIST } from "@/constants";

export const SelectChannelModal = ({
  open,
  setOpen,
  onChange,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChange: (channel: (typeof CHANNELS_LIST)[0]) => void;
}) => {
  const [input, setInput] = useState("");
  const [channels, setChannels] = useState(CHANNELS_LIST.slice(0, 5));
  const [position, setPosition] = useState(0);
  const [disableDrag, setDisableDrag] = useState(false);

  useEffect(() => {
    if (!input) {
      setChannels([]);
    } else {
      setChannels(
        CHANNELS_LIST.filter((channel) =>
          channel.name.toLowerCase().includes(input.toLowerCase()),
        ),
      );
    }
  }, [input]);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      snapPoints={[75, 50]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="quick"
      position={position}
      onPositionChange={setPosition}
      disableDrag={disableDrag}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$4">
        <YStack gap="$2">
          {open && <Input value={input} onChangeText={(e) => setInput(e)} />}
          <Text
            fontWeight="700"
            textTransform="uppercase"
            color="$gray11"
            fontSize="$2"
          >
            Channel results
          </Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={channels}
            keyExtractor={(item) => item.url}
            renderItem={({ item }) => (
              <XStack
                alignItems="center"
                gap="$2"
                marginVertical="$2"
                borderWidth="$0.5"
                borderColor="$borderColor"
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
            contentContainerStyle={{ paddingBottom: 50 }}
            onScrollBeginDrag={() => setDisableDrag(true)}
            onScrollEndDrag={() => setDisableDrag(false)}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
};