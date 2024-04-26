"use client";

import { NookText, Separator, Spinner, View, XStack, YStack } from "@nook/ui";
import { FarcasterUser, User } from "../../types";
import { useUsers } from "../../api/farcaster";
import { FarcasterUserDisplay } from "../../components/farcaster/users/user-display";
import { Link } from "solito/link";
import { VolumeX } from "@tamagui/lucide-icons";
import { unmuteUser } from "../../server/settings";
import { useEffect, useState } from "react";

export const MutedUsers = ({ settings }: { settings: User }) => {
  const { data, isLoading } = useUsers(settings.mutedUsers);
  const [users, setUsers] = useState<FarcasterUser[]>([]);

  useEffect(() => {
    if (data) {
      setUsers(data.data);
    }
  }, [data]);

  const handleUnmuteUser = async (fid: string) => {
    await unmuteUser(fid);
    setUsers((prev) => prev.filter((user) => user.fid !== fid));
  };

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
        <MutedUser key={user.fid} user={user} onPress={handleUnmuteUser} />
      ))}
    </YStack>
  );
};

const MutedUser = ({
  user,
  onPress,
}: { user: FarcasterUser; onPress: (fid: string) => void }) => {
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
            onPress(user.fid);
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
