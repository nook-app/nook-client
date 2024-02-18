import {
  Avatar,
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
import { EnableSignerModal } from "./EnableSignerModal";
import { EntityAvatar } from "@/components/entity/avatar";
import { useEffect, useRef, useState } from "react";
import { SelectChannelModal } from "./SelectChannelModal";
import { ChevronDown, Image, X } from "@tamagui/lucide-icons";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { CHANNELS_LIST } from "@/constants";
import { api } from "@/store/api";
import { createFarcasterPost } from "@/utils/api";

export const CreatePostModal = () => {
  const [selectChannelModalOpen, setSelectChannelModalOpen] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const signerEnabled = useAppSelector(
    (state) => state.user.user?.signerEnabled || false,
  );
  const activeNook = useAppSelector((state) => state.user.activeNook);
  const entity = useAppSelector((state) => state.user.entity);
  const inputRef = useRef<TextInput>(null);
  const [channel, setChannel] = useState<(typeof CHANNELS_LIST)[0]>();
  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchContent] = api.useLazyGetContentQuery();

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

  if (!signerEnabled) {
    return <EnableSignerModal />;
  }

  const handleCreatePost = async () => {
    setIsPosting(true);
    const { contentId } = await createFarcasterPost(message, channel?.id);

    let attempts = 0;

    const executePoll = async () => {
      if (attempts < 1) {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <YStack
        flexGrow={1}
        backgroundColor="$background"
        justifyContent="space-between"
        theme={activeNook?.theme}
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <View>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="$3"
            height="$4"
          >
            <Text fontSize="$6" onPress={() => navigation.goBack()}>
              Cancel
            </Text>
            <Button
              size="$3"
              borderRadius="$10"
              paddingHorizontal="$3.5"
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
          <ScrollView keyboardShouldPersistTaps="handled">
            <XStack alignItems="center">
              <View
                width="$6"
                height="$4"
                justifyContent="center"
                alignItems="center"
              >
                <EntityAvatar entity={entity} size="$4" />
              </View>
              <YStack>
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
              </YStack>
            </XStack>
            <XStack>
              <TextArea
                ref={inputRef}
                autoFocus
                size="$8"
                paddingVertical="$0"
                paddingLeft="$10"
                paddingRight="$3"
                placeholder="What's happening?"
                placeholderTextColor="$gray11"
                height="$20"
                borderWidth="$0"
                value={message}
                onChangeText={setMessage}
              />
            </XStack>
          </ScrollView>
        </View>
        <YStack gap="$2">
          {error && (
            <Text color="$red11" textAlign="center">
              {error?.message}
            </Text>
          )}
          <View borderTopWidth="$1" borderTopColor="$borderColor" padding="$3">
            <Image size={24} />
          </View>
        </YStack>
        <SelectChannelModal
          open={selectChannelModalOpen}
          setOpen={setSelectChannelModalOpen}
          onChange={(channel) => {
            setChannel(channel);
            setSelectChannelModalOpen(false);
          }}
        />
      </YStack>
    </KeyboardAvoidingView>
  );
};
