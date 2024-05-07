"use client";

import {
  NookText,
  Separator,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { FarcasterUser, User } from "@nook/common/types";
import { useUsers } from "../../api/farcaster";
import { FarcasterUserDisplay } from "../../components/farcaster/users/user-display";
import { Link } from "solito/link";
import { VolumeX } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { useMuteUser } from "../../hooks/useMuteUser";

export const MutedUsers = ({ settings }: { settings: User }) => {
  const { data, isLoading } = useUsers(settings.mutedUsers);
  const [users, setUsers] = useState<FarcasterUser[]>([]);

  useEffect(() => {
    if (data) {
      setUsers(data.data);
    }
  }, [data]);

  return (
    <YStack>
      <View padding="$4" gap="$4">
        <NookText muted>
          Posts from muted accounts won't show up across the app unless viewing
          the user's profile. You can mute users directly from their profile or
          posts.
        </NookText>
      </View>
      <Separator borderColor="$borderColorBg" />
      {isLoading && (
        <View padding="$4" gap="$4">
          <Spinner color="$color11" />
        </View>
      )}
      {users.map((user) => (
        <MutedUser key={user.fid} user={user} />
      ))}
    </YStack>
  );
};

const MutedUser = ({ user }: { user: FarcasterUser }) => {
  const { unmuteUser } = useMuteUser(user);
  return (
    <Link href={`/users/${user.username}`}>
      <XStack
        alignItems="center"
        padding="$4"
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
