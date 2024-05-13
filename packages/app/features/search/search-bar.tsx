import {
  NookText,
  Popover,
  Separator,
  Spinner,
  View,
  XStack,
  YStack,
  useDebounceValue,
} from "@nook/app-ui";
import { Search } from "@tamagui/lucide-icons";
import { SearchInput } from "./search-input";
import { useEffect, useRef, useState } from "react";
import { useSearchPreview } from "../../api/discover";
import {
  FarcasterUserAvatar,
  FarcasterUserBadge,
  FarcasterUserDisplay,
} from "../../components/farcaster/users/user-display";
import {
  FarcasterChannelAvatar,
  FarcasterChannelBadge,
  FarcasterChannelDisplay,
} from "../../components/farcaster/channels/channel-display";
import { useRouter } from "solito/navigation";
import { NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { Channel, FarcasterUser } from "@nook/common/types";
import { Link } from "../../components/link";
import { FarcasterPowerBadge } from "../../components/farcaster/users/power-badge";
import { UserFollowBadge } from "../../components/farcaster/users/user-follow-badge";
import { ChannelFollowBadge } from "../../components/farcaster/channels/channel-follow-badge";

export const SearchBar = ({
  user,
  channel,
  defaultValue,
}: { user?: FarcasterUser; channel?: Channel; defaultValue?: string }) => {
  const [value, setValue] = useState<string>(defaultValue || "");
  const [open, setOpen] = useState<boolean>(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const debouncedValue = useDebounceValue(value, 300);

  const handleFocus = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleBlur = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (event.nativeEvent.key === "Enter") {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover
      placement="bottom"
      size="$5"
      allowFlip
      open={open}
      offset={{
        mainAxis: 0,
      }}
    >
      <Popover.Trigger>
        <SearchInput
          value={value}
          onChangeText={setValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
        />
      </Popover.Trigger>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColorBg"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "100ms",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
      >
        <Popover.Arrow
          borderWidth={1}
          borderColor="$borderColorBg"
          display="none"
        />
        <SearchResults value={debouncedValue} user={user} channel={channel} />
      </Popover.Content>
    </Popover>
  );
};

export const SearchResults = ({
  value,
  user,
  channel,
}: { value: string; user?: FarcasterUser; channel?: Channel }) => {
  const { data, isLoading } = useSearchPreview(value);

  if (!value || !data) {
    return (
      <View
        minWidth={350}
        padding="$4"
        justifyContent="center"
        alignItems="center"
      >
        {isLoading ? (
          <Spinner size="small" />
        ) : (
          <NookText muted fontSize="$4">
            Search for casts, users, or channels
          </NookText>
        )}
      </View>
    );
  }

  return (
    <YStack minWidth={350}>
      {channel && (
        <ChannelContextSearchResult channel={channel} value={value} />
      )}
      {user && <UserContextSearchResult value={value} user={user} />}
      <Link href={`/search?q=${encodeURIComponent(value)}`}>
        <View
          paddingVertical="$3"
          paddingHorizontal="$2"
          hoverStyle={{
            backgroundColor: "$color4",
            // @ts-ignore
            transition: "all 0.2s ease-in",
          }}
        >
          <XStack gap="$2.5" alignItems="center">
            <View width="$4" alignItems="center" justifyContent="center">
              <Search size={24} strokeWidth={3} />
            </View>
            <NookText fontWeight="600">{value}</NookText>
          </XStack>
        </View>
      </Link>
      {data.users.length > 0 && (
        <>
          <Separator
            width="100%"
            borderBottomColor="$borderColorBg"
            borderBottomWidth="$0.25"
            marginVertical="$2"
          />
          <NookText
            fontWeight="600"
            paddingHorizontal="$2"
            paddingBottom="$1"
            fontSize="$4"
          >
            Users
          </NookText>
        </>
      )}
      {data.users.slice(0, 5).map((user) => (
        <Link key={user.fid} href={`/users/${user.username}`}>
          <XStack
            gap="$2.5"
            paddingHorizontal="$2.5"
            paddingVertical="$2"
            hoverStyle={{
              transform: "all 0.2s ease-in-out",
              backgroundColor: "$color2",
            }}
          >
            <FarcasterUserAvatar user={user} size="$4" />
            <YStack flexShrink={1} gap="$1" flexGrow={1}>
              <XStack justifyContent="space-between">
                <YStack gap="$1">
                  <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                    <NookText
                      fontWeight="700"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {`${user.displayName || user.username || `!${user.fid}`}`}
                    </NookText>
                    <FarcasterPowerBadge
                      badge={user.badges?.powerBadge ?? false}
                    />
                  </XStack>
                  <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                    <NookText
                      muted
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      flexShrink={1}
                    >
                      {user.username ? `@${user.username}` : `!${user.fid}`}
                    </NookText>
                    <UserFollowBadge user={user} />
                  </XStack>
                </YStack>
              </XStack>
            </YStack>
          </XStack>
        </Link>
      ))}
      {data.channels.length > 0 && (
        <>
          <Separator
            width="100%"
            borderBottomColor="$borderColorBg"
            borderBottomWidth="$0.25"
            marginVertical="$2"
          />
          <NookText
            fontWeight="600"
            paddingHorizontal="$2"
            paddingBottom="$1"
            fontSize="$4"
          >
            Channels
          </NookText>
        </>
      )}
      {data.channels.slice(0, 5).map((channel) => (
        <Link key={channel.channelId} href={`/channels/${channel.channelId}`}>
          <XStack
            gap="$2.5"
            paddingHorizontal="$2.5"
            paddingVertical="$2"
            hoverStyle={{
              transform: "all 0.2s ease-in-out",
              backgroundColor: "$color2",
            }}
          >
            <FarcasterChannelAvatar channel={channel} size="$4" />
            <YStack flexShrink={1} gap="$1" flexGrow={1}>
              <XStack justifyContent="space-between">
                <YStack gap="$1">
                  <NookText
                    fontWeight="700"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {channel.name}
                  </NookText>
                  <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                    <NookText
                      muted
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      flexShrink={1}
                    >
                      {`/${channel.channelId}`}
                    </NookText>
                    <ChannelFollowBadge channel={channel} />
                  </XStack>
                </YStack>
              </XStack>
            </YStack>
          </XStack>
        </Link>
      ))}
    </YStack>
  );
};

const ChannelContextSearchResult = ({
  channel,
  value,
}: { channel: Channel; value: string }) => {
  return (
    <Link href={`/search?q=${encodeURIComponent(value)}`}>
      <View
        padding="$3"
        hoverStyle={{
          backgroundColor: "$color4",
          // @ts-ignore
          transition: "all 0.2s ease-in",
        }}
      >
        <XStack gap="$2.5" alignItems="center">
          <View width="$4" alignItems="center" justifyContent="center">
            <Search size={24} strokeWidth={3} />
          </View>
          <FarcasterChannelBadge channel={channel} />
          <NookText fontWeight="600" marginTop="$-1">
            {value}
          </NookText>
        </XStack>
      </View>
    </Link>
  );
};

const UserContextSearchResult = ({
  user,
  value,
}: { user: FarcasterUser; value: string }) => {
  return (
    <Link href={`/search?q=${encodeURIComponent(value)}`}>
      <View
        padding="$3"
        hoverStyle={{
          backgroundColor: "$color4",
          // @ts-ignore
          transition: "all 0.2s ease-in",
        }}
      >
        <XStack gap="$2.5" alignItems="center">
          <View width="$4" alignItems="center" justifyContent="center">
            <Search size={24} strokeWidth={3} />
          </View>
          <FarcasterUserBadge user={user} />
          <NookText fontWeight="600" marginTop="$-1">
            {value}
          </NookText>
        </XStack>
      </View>
    </Link>
  );
};
