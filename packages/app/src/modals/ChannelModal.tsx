import { Avatar, Button, Text, View, XStack, YStack } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { useCallback } from "react";
import { useNooks } from "@/hooks/useNooks";

export const ChannelModal = () => {
  const { navigateToNook } = useNooks();
  const theme = useAppSelector((state) => state.user.theme);
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.Channel],
  );
  const channel = useAppSelector((state) =>
    initialState?.channelId
      ? selectChannelById(state, initialState?.channelId)
      : undefined,
  );
  const { closeAll, close } = useModal(ModalName.Channel);

  const onPress = useCallback(() => {
    if (channel) {
      navigateToNook(`channel:${channel.contentId}`);
      closeAll();
    }
  }, [channel, closeAll, navigateToNook]);

  return (
    <BottomSheetModal onClose={close} enableDynamicSizing>
      <View theme={theme}>
        {channel && (
          <YStack
            flexGrow={1}
            justifyContent="space-between"
            gap="$3"
            paddingHorizontal="$3"
          >
            <YStack
              gap="$4"
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$3"
            >
              <XStack gap="$2" alignItems="center">
                <Avatar circular size="$5">
                  <Avatar.Image src={channel.imageUrl} />
                  <Avatar.Fallback backgroundColor="$backgroundPress" />
                </Avatar>
                <YStack>
                  <Text fontWeight="700" fontSize="$5">
                    {channel.name}
                  </Text>
                  <Text color="$gray11" fontSize="$4">
                    {channel.slug}
                  </Text>
                </YStack>
              </XStack>
              {channel.description && <Text>{channel.description}</Text>}
            </YStack>
            <Button onPress={onPress}>Visit Nook</Button>
          </YStack>
        )}
      </View>
    </BottomSheetModal>
  );
};
