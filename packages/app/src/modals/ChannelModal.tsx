import { Avatar, Button, Text, View, XStack, YStack } from "tamagui";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setActiveNook } from "@/store/slices/user";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { RootStackParamList } from "@/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { selectChannelById } from "@/store/slices/channel";
import { BottomSheetModal } from "@/components/utils/BottomSheetModal";
import { setActiveChannelModal } from "@/store/slices/navigator";

export const ChannelModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useAppSelector((state) => state.user.theme);
  const dispatch = useAppDispatch();
  const channel = useAppSelector((state) =>
    state.navigator.activeChannelModal
      ? selectChannelById(state, state.navigator.activeChannelModal)
      : undefined,
  );

  return (
    <BottomSheetModal
      open={!!channel}
      onClose={() => dispatch(setActiveChannelModal())}
      enableDynamicSizing
    >
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
            <Button
              onPress={() => {
                const params = {
                  nookId: `channel:${channel.contentId}`,
                };
                navigation.navigate("Shelf", params);
                dispatch(setActiveChannelModal());
                dispatch(setActiveNook(`channel:${channel.contentId}`));
              }}
            >
              Visit Nook
            </Button>
          </YStack>
        )}
      </View>
    </BottomSheetModal>
  );
};