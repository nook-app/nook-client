import { Avatar, Button, Sheet, Text, View, XStack, YStack } from "tamagui";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setActiveChannelModal, setActiveNook } from "@/store/slices/user";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "@/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { CHANNELS } from "@/constants";

export const ChannelModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const activeChannelModal = useAppSelector(
    (state) => state.user.activeChannelModal,
  );

  const [position, setPosition] = useState(0);

  const channel = CHANNELS[activeChannelModal || ""];

  return (
    <Sheet
      open={!!activeChannelModal}
      onOpenChange={() => {
        dispatch(setActiveChannelModal());
      }}
      snapPoints={[50]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="quick"
      position={position}
      onPositionChange={setPosition}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame style={{ paddingBottom: insets.bottom }}>
        {channel && activeChannelModal && (
          <View flexGrow={1} justifyContent="space-between" padding="$4">
            <YStack gap="$4">
              <XStack gap="$2" alignItems="center">
                <Avatar circular size="$6">
                  <Avatar.Image src={channel.imageUrl} />
                  <Avatar.Fallback backgroundColor="$backgroundPress" />
                </Avatar>
                <YStack>
                  <Text fontWeight="700" fontSize="$6">
                    {channel.name}
                  </Text>
                </YStack>
              </XStack>
              {channel.description && <Text>{channel.description}</Text>}
            </YStack>
            <Button
              onPress={() => {
                const params = {
                  nookId: `channel:${activeChannelModal}`,
                };
                navigation.navigate("Shelf", params);
                dispatch(setActiveChannelModal());
                dispatch(setActiveNook(`channel:${activeChannelModal}`));
              }}
            >
              Visit Nook
            </Button>
          </View>
        )}
      </Sheet.Frame>
    </Sheet>
  );
};
