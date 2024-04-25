import {
  NookText,
  Popover,
  Separator,
  Spinner,
  View,
  XStack,
  YStack,
  useDebounceValue,
} from "@nook/ui";
import { Search } from "@tamagui/lucide-icons";
import { SearchInput } from "./search-input";
import { useEffect, useRef, useState } from "react";
import { useSearchPreview } from "../../api/discover";
import {
  FarcasterUserBadge,
  FarcasterUserDisplay,
} from "../../components/farcaster/users/user-display";
import { Link } from "solito/link";
import {
  FarcasterChannelBadge,
  FarcasterChannelDisplay,
} from "../../components/farcaster/channels/channel-display";
import { useParams, useRouter } from "solito/navigation";
import { useChannel, useUser } from "../../api/farcaster";
import { NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";

export const SearchBar = ({ defaultValue }: { defaultValue?: string }) => {
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
        borderColor="$borderColor"
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
          borderColor="$borderColor"
          display="none"
        />
        <SearchResults value={debouncedValue} />
      </Popover.Content>
    </Popover>
  );
};

const SearchResults = ({ value }: { value: string }) => {
  const { data, isLoading } = useSearchPreview(value);
  const { channelId, username } = useParams();

  if (!value || !data) {
    return (
      <View
        width={350}
        padding="$4"
        justifyContent="center"
        alignItems="center"
      >
        {isLoading ? (
          <Spinner color="$color11" size="small" />
        ) : (
          <NookText muted fontSize="$4">
            Search for casts, users, or channels
          </NookText>
        )}
      </View>
    );
  }

  return (
    <YStack width={350}>
      {channelId && (
        <ChannelContextSearchResult
          channelId={channelId as string}
          value={value}
        />
      )}
      {username && (
        <UserContextSearchResult username={username as string} value={value} />
      )}
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
            <NookText fontWeight="600">{value}</NookText>
          </XStack>
        </View>
      </Link>
      <Separator />
      {data.users.map((user) => (
        <Link key={user.fid} href={`/users/${user.username}`}>
          <View
            padding="$3"
            hoverStyle={{
              backgroundColor: "$color4",
              // @ts-ignore
              transition: "all 0.2s ease-in",
            }}
          >
            <FarcasterUserDisplay user={user} />
          </View>
        </Link>
      ))}
      <Separator />
      {data.channels.map((channel) => (
        <Link key={channel.channelId} href={`/channels/${channel.channelId}`}>
          <View
            padding="$3"
            hoverStyle={{
              backgroundColor: "$color4",
              // @ts-ignore
              transition: "all 0.2s ease-in",
            }}
          >
            <FarcasterChannelDisplay channel={channel} />
          </View>
        </Link>
      ))}
    </YStack>
  );
};

const ChannelContextSearchResult = ({
  channelId,
  value,
}: { channelId: string; value: string }) => {
  const { data } = useChannel(channelId);

  if (!data) return null;

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
          <FarcasterChannelBadge channel={data} />
          <NookText fontWeight="600" marginTop="$-1">
            {value}
          </NookText>
        </XStack>
      </View>
    </Link>
  );
};

const UserContextSearchResult = ({
  username,
  value,
}: { username: string; value: string }) => {
  const { data } = useUser(username);

  if (!data) return null;

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
          <FarcasterUserBadge user={data} />
          <NookText fontWeight="600" marginTop="$-1">
            {value}
          </NookText>
        </XStack>
      </View>
    </Link>
  );
};
