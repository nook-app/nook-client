import {
  Button,
  ScrollView,
  Spinner,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useAppSelector } from "@/hooks/useAppSelector";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { SelectChannelModal } from "./SelectChannelModal";
import { ChevronDown, Image } from "@tamagui/lucide-icons";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { nookApi } from "@/store/apis/nookApi";
import { farcasterApi } from "@/store/apis/farcasterApi";
import { Channel } from "@nook/common/types";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { closeModal, openModal } from "@/store/slices/navigator";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export const CreatePostModal = () => {
  const [selectChannelModalOpen, setSelectChannelModalOpen] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const signerEnabled = useAppSelector(
    (state) => state.user.user?.signerEnabled || false,
  );
  const entity = useAppSelector((state) => state.user.entity);
  const inputRef = useRef<TextInput>(null);
  const [channel, setChannel] = useState<Channel>();
  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchContent] = nookApi.useLazyGetContentQuery();
  const [createPost] = farcasterApi.useCreatePostMutation();

  useEffect(() => {
    if (selectChannelModalOpen) {
      Keyboard.dismiss();
    } else {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectChannelModalOpen]);

  useEffect(() => {
    if (!signerEnabled) {
      dispatch(
        openModal({ name: ModalName.EnableSigner, initialState: undefined }),
      );
    }
  }, [signerEnabled, dispatch]);

  const onClose = useCallback(() => {
    dispatch(closeModal({ name: ModalName.CreatePost }));
  }, [dispatch]);

  const handleCreatePost = async () => {
    setIsPosting(true);
    const response = await createPost({ message, channel: channel?.contentId });
    if ("error" in response) {
      let errorMessage = "An unknown error occurred";
      if (typeof response.error === "object" && "status" in response.error) {
        errorMessage = `HTTP Error ${response.error.status}: ${JSON.stringify(
          response.error.data,
        )}`;
      } else if (
        response.error &&
        typeof response.error === "object" &&
        "message" in response.error &&
        response.error.message
      ) {
        errorMessage = response.error.message;
      }
      setError(new Error(errorMessage));
      setIsPosting(false);
      return;
    }

    const { contentId } = response.data;

    let attempts = 0;

    const executePoll = async () => {
      if (attempts < 30) {
        try {
          const { data } = await fetchContent(contentId);
          if (data) {
            navigation.goBack();
            navigation.navigate("Content", {
              contentId,
            });
            return;
          }
        } catch (e) {}
        attempts++;
        setTimeout(executePoll, 1000);
      } else {
        setError(new Error("Post was submitted, but it's taking too long"));
      }
    };

    executePoll();
  };

  const isDisabled = !message?.length || isPosting;

  return (
    <BottomSheetModal onClose={onClose} fullScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <YStack
          flexGrow={1}
          backgroundColor="$background"
          justifyContent="space-between"
        >
          <BottomSheetScrollView keyboardShouldPersistTaps="handled">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="$1"
              height="$4"
              marginBottom="$4"
            >
              <XStack alignItems="center">
                <View
                  width="$6"
                  height="$4"
                  justifyContent="center"
                  alignItems="center"
                >
                  {entity && (
                    <EntityAvatar entityId={entity._id.toString()} size="$4" />
                  )}
                </View>
                <Button
                  onPress={() => setSelectChannelModalOpen(true)}
                  backgroundColor="transparent"
                  borderColor="$color7"
                  borderWidth="$1"
                  borderRadius="$10"
                  size="$2.5"
                  paddingHorizontal="$3"
                  paddingTop="$1"
                >
                  <XStack alignItems="center" gap="$1">
                    <Text color="$color11" fontWeight="700">
                      {channel ? channel.name : "Channel"}
                    </Text>
                    <ChevronDown size={20} color="$color11" />
                  </XStack>
                </Button>
              </XStack>
              <Button
                size="$3"
                borderRadius="$10"
                paddingHorizontal="$3.5"
                marginHorizontal="$2"
                backgroundColor={
                  isDisabled ? "$backgroundStrong" : "$backgroundFocus"
                }
                fontWeight="700"
                fontSize="$4"
                onPress={handleCreatePost}
                disabled={isDisabled}
              >
                {isPosting ? <Spinner /> : "Post"}
              </Button>
            </XStack>
            <TextArea
              ref={inputRef}
              autoFocus
              size="$8"
              paddingVertical="$0"
              paddingHorizontal="$3"
              placeholder="What's happening?"
              placeholderTextColor="$gray11"
              height="$20"
              borderWidth="$0"
              value={message}
              onChangeText={setMessage}
            />
          </BottomSheetScrollView>
          <YStack gap="$2">
            {error && (
              <Text color="$red11" textAlign="center">
                {error?.message}
              </Text>
            )}
            <View
              borderTopWidth="$1"
              borderTopColor="$borderColor"
              padding="$3"
            >
              <Image size={24} />
            </View>
          </YStack>
          <SelectChannelModal
            open={selectChannelModalOpen}
            setOpen={setSelectChannelModalOpen}
            channel={channel}
            onChange={(channel) => {
              setChannel(channel);
              setSelectChannelModalOpen(false);
            }}
          />
        </YStack>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
};
