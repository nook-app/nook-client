"use client";

import { NookText, Spinner, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterUserV1, User } from "@nook/common/types";
import { FarcasterUserDisplay } from "../../components/farcaster/users/user-display";
import { VolumeX } from "@tamagui/lucide-icons";
import { useMuteUser } from "../../hooks/useMuteUser";
import { Link } from "../../components/link";
import { useMuteStore } from "../../store/useMuteStore";
import { useUsers } from "../../hooks/api/users";

export const MutedUsers = ({ settings }: { settings: User }) => {
  const users = useMuteStore((state) => state.users);
  const { data, isLoading } = useUsers(
    Object.entries(users)
      .filter(([_, muted]) => muted)
      .map(([fid]) => fid),
  );

  return (
    <YStack>
      <View padding="$2.5" gap="$4">
        <NookText muted>
          Posts from muted accounts won't show up across the app unless viewing
          the user's profile. You can mute users directly from their profile or
          posts.
        </NookText>
      </View>
      {isLoading && (
        <View padding="$2.5" gap="$4">
          <Spinner />
        </View>
      )}
      {data?.data.map((user) => (
        <MutedUser key={user.fid} user={user} />
      ))}
    </YStack>
  );
};

const MutedUser = ({ user }: { user: FarcasterUserV1 }) => {
  const { unmuteUser } = useMuteUser(user);
  const isMuted = useMuteStore((state) => state.users[user.fid]);

  if (!isMuted) {
    return null;
  }

  return (
    <Link href={`/users/${user.username}`}>
      <XStack
        alignItems="center"
        padding="$2.5"
        hoverStyle={{
          backgroundColor: "$color2",
          transform: "all 0.2s ease-in-out",
        }}
      >
        <FarcasterUserDisplay user={user} withBio />
        <View
          cursor="pointer"
          width="$2.5"
          height="$2.5"
          justifyContent="center"
          alignItems="center"
          borderRadius="$10"
          group
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$red3",
          }}
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
            unmuteUser();
          }}
        >
          <VolumeX
            size={20}
            $group-hover={{
              color: "$red9",
              opacity: 1,
            }}
            color="$red9"
          />
        </View>
      </XStack>
    </Link>
  );
};
