import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/context/auth";
import { CreatePostProvider, useCreatePost } from "@/context/createPost";
import { SheetType, useSheets } from "@/context/sheet";
import { useUser } from "@/hooks/useUser";
import { ChevronDown, Image, Plus, X } from "@tamagui/lucide-icons";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView as RNScrollView,
  TextInput,
  View as RNView,
  Text as RNText,
} from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  ScrollView,
  Separator,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
  useDebounce,
  useDebounceValue,
  useTheme,
} from "tamagui";
import { useHeaderHeight } from "@react-navigation/elements";
import { memo, useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCast } from "@/hooks/useCast";
import { useChannel } from "@/hooks/useChannel";
import { SubmitCastAddRequest, UrlContentResponse } from "@/types";
import { FarcasterCast } from "@/components/farcaster/FarcasterCast";
import { EmbedCast } from "@/components/embeds/EmbedCast";
import { Embed } from "@/components/embeds/Embed";
import {
  FetchChannelsResponse,
  FetchUsersResponse,
  fetchContent,
  searchChannels,
  searchUsers,
} from "@/utils/api";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/Label";

export default function CreatePostScreen() {
  return <CreatePostEditor />;
}

const CreatePostEditor = () => {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const {
    channelId,
    parentHash,
    embedHash,
    text: defaultText,
  } = useLocalSearchParams();
  const { cast: parent } = useCast((parentHash as string) || "");
  const { cast: embed } = useCast((embedHash as string) || "");
  const { channel } = useChannel((channelId as string) || "");

  const scrollViewRef = useRef<RNScrollView>(null);
  const inputRef = useRef<RNView>(null);

  const initialPost: SubmitCastAddRequest = {
    text: (defaultText as string) || "",
    parentFid: parent?.user?.fid,
    parentHash: parent?.hash,
    castEmbedFid: embed?.user?.fid,
    castEmbedHash: embed?.hash,
    parentUrl: channel?.url,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // @ts-ignore
      inputRef.current?.measureLayout(
        scrollViewRef.current,
        (x, y, width, height) => {
          scrollViewRef.current?.scrollTo({ y: y, animated: true });
        },
      );
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <CreatePostProvider initialPost={initialPost} initialChannel={channel}>
      <View
        flex={1}
        backgroundColor="$color1"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={headerHeight}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$2"
          >
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : undefined)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View padding="$2">
                <X size={24} />
              </View>
            </TouchableOpacity>
            <CreatePostHeader />
          </XStack>
          <YStack justifyContent="space-between" flex={1}>
            <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="always">
              <View marginHorizontal="$3" marginTop="$3">
                {parent && (
                  <FarcasterCast
                    cast={parent}
                    disableMenu
                    onlyMedia
                    disableLink
                    hideActionBar
                    disableParent
                  />
                )}
                <View ref={inputRef}>
                  <CreatePostItem index={0} />
                </View>
              </View>
            </ScrollView>
            <CreatePostBottomBar />
          </YStack>
        </KeyboardAvoidingView>
      </View>
    </CreatePostProvider>
  );
};

const CreatePostItem = memo(({ index }: { index: number }) => {
  const theme = useTheme();
  const { updateText, activeIndex, removePost, setActiveIndex, posts } =
    useCreatePost();
  const post = posts[index];

  const inputRef = useRef<TextInput>(null);

  const translateY = useSharedValue(-50);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 100 });

    if (activeIndex === index) {
      inputRef.current?.focus();
    }
  }, [activeIndex, translateY]);

  useEffect(() => {
    if (activeIndex === index) {
      inputRef.current?.focus();
    }
  }, [activeIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleFocusOnPress = () => {
    console.log("handle focus on press");
    setActiveIndex(index);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [post.text]);

  return (
    <>
      <Animated.View style={index === 0 ? {} : animatedStyle}>
        <XStack
          gap="$2"
          opacity={activeIndex === index ? 1 : 0.4}
          animation="quick"
          onPress={handleFocusOnPress}
        >
          <YStack alignItems="center" width="$4">
            <CreatePostAvatar />
            <Separator
              vertical
              borderWidth="$0.5"
              borderColor="$color5"
              backgroundColor="$color5"
              opacity={posts[index + 1] ? 1 : 0}
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
                placeholder={
                  index > 0 ? "Add another post" : "What's happening?"
                }
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
            <CreatePostEmbeds post={post} index={index} />
          </YStack>
          <YStack width="$3">
            {activeIndex === index && index > 0 && (
              <TouchableOpacity
                onPress={() => removePost(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View padding="$2">
                  <X size={20} />
                </View>
              </TouchableOpacity>
            )}
          </YStack>
        </XStack>
      </Animated.View>
      {posts[index + 1] && <CreatePostItem index={index + 1} />}
    </>
  );
});

const CreatePostEmbeds = memo(
  ({ post, index }: { post: SubmitCastAddRequest; index: number }) => {
    const { removeEmbed, isUploadingImages } = useCreatePost();
    const [embeds, setEmbeds] = useState<UrlContentResponse[]>([]);
    const [isFetchingEmbeds, setIsFetchingEmbeds] = useState(false);

    const { cast: embed } = useCast(post.castEmbedHash || "");

    const fetchEmbeds = useDebounce(async () => {
      const allEmbeds: string[] = [];
      if (post.embeds && post.embeds.length > 0) {
        for (const activeEmbed of post.embeds) {
          allEmbeds.push(activeEmbed);
        }
      }
      if (post.parsedEmbeds && post.parsedEmbeds.length > 0) {
        for (const activeEmbed of post.parsedEmbeds) {
          allEmbeds.push(activeEmbed);
        }
      }

      if (allEmbeds.length === 0) {
        setEmbeds([]);
        return;
      }

      const extraEmbeds = embeds.filter(
        (embed) => !allEmbeds.some((e) => e === embed.uri),
      );
      const embedsToFetch = allEmbeds.filter(
        (embed) => !embeds.some((e) => e.uri === embed),
      );

      if (embedsToFetch.length === 0) {
        setEmbeds((prev) =>
          prev.filter((e) => !extraEmbeds.some((extra) => extra.uri === e.uri)),
        );
        return;
      }

      setIsFetchingEmbeds(true);
      const fetchedEmbeds = await Promise.all(embedsToFetch.map(fetchContent));
      setEmbeds(
        (prev) =>
          allEmbeds
            .map(
              (embed) =>
                prev.find((e) => e.uri === embed) ||
                fetchedEmbeds.find((e) => e?.uri === embed),
            )
            .filter(Boolean) as UrlContentResponse[],
      );
      setIsFetchingEmbeds(false);
    }, 1000);

    useEffect(() => {
      fetchEmbeds();
    }, [post.embeds, post.parsedEmbeds]);

    return (
      <YStack gap="$2">
        {((embeds.length === 0 && isFetchingEmbeds) || isUploadingImages) && (
          <View padding="$4">
            <Spinner />
          </View>
        )}
        {embeds.length > 0 && (
          <YStack padding="$2" marginTop="$4" gap="$2">
            <PostEmbedsDisplay
              embeds={embeds}
              onRemove={(url) => removeEmbed(index, url)}
            />
          </YStack>
        )}
        {embed && (
          <View padding="$2.5">
            <EmbedCast cast={embed} />
          </View>
        )}
      </YStack>
    );
  },
);

const CreatePostImageSelector = () => {
  const { uploadImages, activeEmbedLimit, activeIndex } = useCreatePost();

  const handleImageSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
      selectionLimit: activeEmbedLimit,
      allowsMultipleSelection: true,
    });

    if (result.canceled || !result.assets) return;

    const newImages: string[] = [];
    for (const asset of result.assets) {
      if (!asset.base64) continue;
      newImages.push(asset.base64);
    }

    await uploadImages(activeIndex, newImages);
  };

  return (
    <TouchableOpacity
      onPress={activeEmbedLimit > 0 ? handleImageSelect : undefined}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View>
        <Image
          size={24}
          color={activeEmbedLimit === 0 ? "$mauve10" : "$mauve12"}
        />
      </View>
    </TouchableOpacity>
  );
};

const CreatePostAvatar = ({ size = "$4" }: { size?: string }) => {
  const { openSheet } = useSheets();
  const { session } = useAuth();
  const { user } = useUser(session?.fid || "");
  return (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
        openSheet(SheetType.SwitchAccount);
      }}
    >
      <UserAvatar pfp={user?.pfp} size={size} />
    </TouchableOpacity>
  );
};

const CreatePostChannelSelector = () => {
  const { thread, channel, updateChannel } = useCreatePost();
  const { openSheet } = useSheets();

  if (thread.parentHash) return null;

  return (
    <Button
      onPress={() => {
        Keyboard.dismiss();
        openSheet(SheetType.ChannelSelector, {
          channels: channel ? [channel] : [],
          onSelectChannel: updateChannel,
          onUnselectChannel: () => updateChannel(undefined),
          showRecommended: true,
        });
      }}
      backgroundColor="transparent"
      borderColor="$color6"
      borderWidth="$0.75"
      borderRadius="$10"
      size="$2.5"
      paddingHorizontal="$2.5"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <XStack alignItems="center" gap="$1">
        {channel?.imageUrl && (
          <UserAvatar pfp={channel.imageUrl} size="$1" useCdn={false} />
        )}
        <Text color="$mauve12" fontWeight="600" fontSize="$2">
          {channel?.name || "Channel"}
        </Text>
        <ChevronDown size={12} color="$mauve11" />
      </XStack>
    </Button>
  );
};

export const CreatePostHeader = () => {
  const { thread } = useCreatePost();
  const { allPostsValid, post, isPosting } = useCreatePost();
  const text = thread.parentHash ? "Reply" : "Post";
  return (
    <XStack gap="$2" alignItems="center">
      <CreatePostAvatar size="$2" />
      <CreatePostChannelSelector />
      <Button
        size="$3"
        borderRadius="$10"
        paddingHorizontal="$3.5"
        backgroundColor={allPostsValid ? "$color9" : "$color3"}
        fontWeight="600"
        fontSize="$4"
        onPress={post}
        disabled={!allPostsValid}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isPosting ? (
          <Spinner />
        ) : (
          <Text color={allPostsValid ? "white" : "$mauve10"} fontWeight="600">
            {text}
          </Text>
        )}
      </Button>
    </XStack>
  );
};

const CreatePostBottomBar = () => {
  const { activePostLength, addPost, activePost, count, activeIndex } =
    useCreatePost();
  const isDisabled = activePost?.text.length === 0 && activeIndex + 1 !== count;
  return (
    <YStack>
      <MentionSearch />
      <ChannelMentionSearch />
      <XStack
        borderTopWidth="$0.5"
        borderTopColor="$borderColor"
        padding="$3"
        justifyContent="space-between"
        alignItems="center"
      >
        <CreatePostImageSelector />
        <XStack gap="$3" alignItems="center">
          <Text
            color={activePostLength > 320 ? "$red11" : "$mauve12"}
            fontWeight="500"
          >{`${activePostLength} / 320`}</Text>
          <TouchableOpacity
            onPress={() => addPost(activeIndex)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isDisabled}
          >
            <View
              backgroundColor={isDisabled ? "$color3" : "$color11"}
              borderRadius="$10"
              height="$1.5"
              width="$1.5"
              alignItems="center"
              justifyContent="center"
            >
              <Plus
                size={16}
                color={isDisabled ? "$mauve10" : "white"}
                strokeWidth={2.5}
              />
            </View>
          </TouchableOpacity>
        </XStack>
      </XStack>
    </YStack>
  );
};

const MentionSearch = () => {
  const { activePost, updateText, activeIndex } = useCreatePost();
  const lastWord = activePost.text.split(/\s+/).pop();
  const isMention = lastWord?.startsWith("@");

  const search = useDebounceValue(lastWord?.slice(1) || "", 500);

  const { data, isLoading } = useQuery<FetchUsersResponse>({
    queryKey: ["mention", search],
    queryFn: () => searchUsers(search, undefined, 10),
    enabled: isMention && !!lastWord && lastWord.length > 1,
  });

  if (!isMention || !lastWord) return null;

  return (
    <View maxHeight="$15" borderTopWidth="$0.5" borderColor="$borderColor">
      {isLoading ? (
        <YStack
          alignItems="center"
          justifyContent="center"
          padding="$3"
          gap="$2"
        >
          <Spinner />
          <Label>Searching users...</Label>
        </YStack>
      ) : (
        <FlatList
          data={data?.data || []}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                updateText(
                  activeIndex,
                  activePost.text.replace(lastWord, `@${item.username} `),
                );
              }}
            >
              <XStack
                gap="$2"
                alignItems="center"
                flexShrink={1}
                paddingHorizontal="$3"
                paddingVertical="$2"
              >
                <UserAvatar pfp={item.pfp} size="$4" />
                <YStack flexShrink={1} gap="$1">
                  <Text fontWeight="600">{item.displayName}</Text>
                  <Text color="$mauve11" fontWeight="500">
                    {item.username ? `@${item.username}` : `!${item.fid}`}
                  </Text>
                </YStack>
              </XStack>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const ChannelMentionSearch = () => {
  const { activePost, updateText, activeIndex } = useCreatePost();
  const lastWord = activePost.text.split(/\s+/).pop();
  const isMention = lastWord?.startsWith("/");

  const search = useDebounceValue(lastWord?.slice(1) || "", 500);

  const { data, isLoading } = useQuery<FetchChannelsResponse>({
    queryKey: ["mention", search],
    queryFn: () => searchChannels(search, undefined, 10),
    enabled: isMention && !!lastWord && lastWord.length > 1,
  });

  if (!isMention || !lastWord) return null;

  return (
    <View maxHeight="$15" borderTopWidth="$0.5" borderColor="$borderColor">
      {isLoading ? (
        <YStack
          alignItems="center"
          justifyContent="center"
          padding="$3"
          gap="$2"
        >
          <Spinner />
          <Label>Searching channels...</Label>
        </YStack>
      ) : (
        <FlatList
          data={data?.data || []}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                updateText(
                  activeIndex,
                  activePost.text.replace(lastWord, `/${item.channelId} `),
                );
              }}
            >
              <XStack
                gap="$2"
                alignItems="center"
                flexShrink={1}
                paddingHorizontal="$3"
                paddingVertical="$2"
              >
                <UserAvatar pfp={item.imageUrl} size="$4" />
                <YStack flexShrink={1} gap="$1">
                  <Text fontWeight="600">{item.name}</Text>
                  <Text color="$mauve11" fontWeight="500">
                    {`/${item.channelId}`}
                  </Text>
                </YStack>
              </XStack>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const PostEmbedsDisplay = ({
  embeds,
  onRemove,
}: {
  embeds: UrlContentResponse[];
  onRemove: (content: string) => void;
}) => {
  const isAllImages = embeds.every((content) =>
    content.type?.startsWith("image/"),
  );
  if (isAllImages && embeds.length > 1) {
    return (
      <XStack gap="$1">
        {embeds.map((content) => (
          <View width="50%" padding="$1" key={content.uri}>
            <RemovalEmbed content={content} onRemove={onRemove} />
          </View>
        ))}
      </XStack>
    );
  }

  return (
    <YStack gap="$2">
      {embeds.map((content) => (
        <RemovalEmbed key={content.uri} content={content} onRemove={onRemove} />
      ))}
    </YStack>
  );
};

const RemovalEmbed = ({
  content,
  onRemove,
}: {
  content: UrlContentResponse;
  onRemove: (content: string) => void;
}) => {
  const { count } = useCreatePost();
  return (
    <View width={count > 1 ? "50%" : "100%"}>
      <Embed content={content} />
      <View
        onPress={() => onRemove(content.uri)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        position="absolute"
        top={1}
        left={1}
        margin="$1"
        borderRadius="$10"
        backgroundColor="$color1"
        opacity={0.8}
        padding="$2"
      >
        <X size={16} color="$mauve12" />
      </View>
    </View>
  );
};
