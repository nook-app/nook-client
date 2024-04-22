import {
  NookButton,
  Separator,
  View,
  XStack,
  YStack,
  useTheme,
} from "@nook/ui";
import { CreateCastProvider, useCreateCast } from "./context";
import { TextInput } from "react-native";
import { useEffect, useRef } from "react";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { useAuth } from "../../../context/auth";
import { X } from "@tamagui/lucide-icons";

export const CreateCastEditor = () => {
  const { cast, allCastsValid } = useCreateCast();
  return (
    <View>
      <CreateCastItem index={0} />
      <XStack justifyContent="flex-end">
        <NookButton
          variant="primary"
          height="$3.5"
          onPress={cast}
          disabled={!allCastsValid}
        >
          Cast
        </NookButton>
      </XStack>
    </View>
  );
};

const CreateCastItem = ({ index }: { index: number }) => {
  const theme = useTheme();
  const { updateText, activeIndex, removeCast, setActiveIndex, casts } =
    useCreateCast();
  const { user } = useAuth();

  const post = casts[index];
  const inputRef = useRef<TextInput>(null);

  const handleFocusOnPress = () => {
    setActiveIndex(index);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <XStack
        gap="$2"
        opacity={activeIndex === index ? 1 : 0.4}
        animation="quick"
        onPress={handleFocusOnPress}
      >
        <YStack alignItems="center" width="$4">
          <CdnAvatar src={user?.pfp} size="$3" />
          <Separator
            vertical
            borderWidth="$0.5"
            borderColor="$color5"
            backgroundColor="$color5"
            opacity={casts[index + 1] ? 1 : 0}
            animation={"100ms"}
          />
        </YStack>
        <YStack
          gap="$2"
          marginTop="$1.5"
          width="100%"
          flexShrink={1}
          marginBottom="$4"
        >
          <View>
            <TextInput
              ref={inputRef}
              value={post.text}
              onChangeText={(text) => updateText(index, text)}
              placeholder={index > 0 ? "Add another post" : "What's happening?"}
              placeholderTextColor={theme.mauve11.val}
              style={{
                color: theme.mauve12.val,
                backgroundColor: "transparent",
                fontSize: 18,
                fontWeight: "500",
                paddingVertical: 0,
                paddingHorizontal: 0,
                borderRadius: 0,
                borderWidth: 0,
              }}
              scrollEnabled={false}
              multiline
              onFocus={handleFocusOnPress}
            />
          </View>
          {/* <CreatePostEmbeds post={post} index={index} /> */}
        </YStack>
        <YStack width="$3">
          {activeIndex === index && index > 0 && (
            <NookButton
              variant="ghost"
              size="$2"
              scaleIcon={1.5}
              circular
              icon={X}
              onPress={() => removeCast(index)}
            />
          )}
        </YStack>
      </XStack>
      {casts[index + 1] && <CreateCastItem index={index + 1} />}
    </>
  );
};
