import {
  Avatar,
  Button,
  ScrollView,
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
import { ChevronDown, X } from "@tamagui/lucide-icons";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { CHANNELS_LIST } from "@/constants";

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <YStack
        flexGrow={1}
        backgroundColor="$background"
        theme={activeNook?.theme}
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
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
            backgroundColor="$backgroundFocus"
            fontWeight="700"
            fontSize="$4"
          >
            Post
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
            />
          </XStack>
        </ScrollView>
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
