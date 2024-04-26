import { useAuth } from "../../../context/auth";
import {
  BarChart2,
  Trash,
  UserMinus,
  UserPlus,
  Volume,
  VolumeX,
} from "@tamagui/lucide-icons";
import { submitCastRemove } from "../../../server/farcaster";
import { FarcasterCast, FetchCastsResponse } from "../../../types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { useParams, useRouter } from "solito/navigation";
import { useCallback, useState } from "react";
import { fetchCast } from "../../../api/farcaster";
import { Spinner, useToastController } from "@nook/ui";
import { useFollowUser } from "../../../hooks/useFollowUser";
import {
  muteChannel,
  muteUser,
  unmuteChannel,
  unmuteUser,
} from "../../../server/settings";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";

export const FarcasterCastKebabMenu = ({
  cast,
  queryKey,
}: { cast: FarcasterCast; queryKey?: string[] }) => {
  return (
    <KebabMenu>
      <DeleteCast cast={cast} queryKey={queryKey} />
      <FollowUser cast={cast} queryKey={queryKey} />
      <MuteUser cast={cast} queryKey={queryKey} />
      <MuteChannel cast={cast} queryKey={queryKey} />
      <ViewCastEngagements cast={cast} />
    </KebabMenu>
  );
};

const DeleteCast = ({
  cast,
  closeMenu,
  queryKey,
}: { cast: FarcasterCast; closeMenu?: () => void; queryKey?: string[] }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToastController();
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (cast.user.fid !== session?.fid) {
    return null;
  }

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await submitCastRemove({ hash: cast.hash });

    const maxAttempts = 60;

    let response;
    let currentAttempts = 0;
    while (currentAttempts < maxAttempts && response) {
      currentAttempts++;
      response = await fetchCast(cast.hash);
      if (!response) break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (response) {
      setIsDeleting(false);
      toast.show("Failed to refresh");
      return;
    }

    if (queryKey) {
      queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
        queryKey,
        (data) => {
          if (!data) return;
          return {
            ...data,
            pages: data.pages.map((page) => {
              return {
                ...page,
                data: page.data.filter((c) => c.hash !== cast.hash),
              };
            }),
          };
        },
      );
    }

    setIsDeleting(false);
    toast.show("Cast deleted");
    if (params.hash === cast.hash) {
      router.push("/");
    }
  }, [cast, toast, router, params.hash, queryKey, queryClient]);

  return (
    <KebabMenuItem
      Icon={isDeleting ? <Spinner color="$color11" /> : Trash}
      title="Delete cast"
      color="$red9"
      onPress={handleDelete}
      closeMenu={closeMenu}
    />
  );
};

const FollowUser = ({
  cast,
  closeMenu,
  queryKey,
}: { cast: FarcasterCast; closeMenu?: () => void; queryKey?: string[] }) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { isFollowing, followUser, unfollowUser } = useFollowUser(cast.user);
  if (cast.user.fid === session?.fid) {
    return null;
  }

  const handleUnfollowUser = useCallback(async () => {
    await unfollowUser({});
    if (queryKey) {
      queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
        queryKey,
        (data) => {
          if (!data) return;
          return {
            ...data,
            pages: data.pages.map((page) => {
              return {
                ...page,
                data: page.data.map((c) => {
                  if (c.user.fid === cast.user.fid) {
                    return {
                      ...c,
                      user: {
                        ...c.user,
                        context: {
                          followers: c.user.context?.followers || false,
                          following: false,
                        },
                        engagement: {
                          ...c.user.engagement,
                          followers: c.user.engagement.followers - 1,
                        },
                      },
                    };
                  }
                  return c;
                }),
              };
            }),
          };
        },
      );
    }
  }, [unfollowUser, queryClient, queryKey, cast]);

  const handleFollowUser = useCallback(async () => {
    await followUser({});
    if (queryKey) {
      queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
        queryKey,
        (data) => {
          if (!data) return;
          return {
            ...data,
            pages: data.pages.map((page) => {
              return {
                ...page,
                data: page.data.map((c) => {
                  if (c.user.fid === cast.user.fid) {
                    return {
                      ...c,
                      user: {
                        ...c.user,
                        context: {
                          followers: c.user.context?.followers || false,
                          following: true,
                        },
                        engagement: {
                          ...c.user.engagement,
                          followers: c.user.engagement.followers + 1,
                        },
                      },
                    };
                  }
                  return c;
                }),
              };
            }),
          };
        },
      );
    }
  }, [followUser, queryClient, queryKey, cast]);

  if (isFollowing) {
    return (
      <KebabMenuItem
        Icon={UserMinus}
        title={`Unfollow ${
          cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
        }`}
        color="$mauve12"
        onPress={handleUnfollowUser}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={UserPlus}
      title={`Follow ${
        cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
      }`}
      onPress={handleFollowUser}
      closeMenu={closeMenu}
    />
  );
};

const MuteUser = ({
  cast,
  closeMenu,
  queryKey,
}: { cast: FarcasterCast; closeMenu?: () => void; queryKey?: string[] }) => {
  const { session, settings } = useAuth();
  const queryClient = useQueryClient();

  if (cast.user.fid === session?.fid) {
    return null;
  }

  const isMuted = settings?.mutedUsers.includes(cast.user.fid);

  const handleMute = useCallback(async () => {
    await muteUser(cast.user.fid);
    if (queryKey) {
      queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
        queryKey,
        (data) => {
          if (!data) return;
          return {
            ...data,
            pages: data.pages.map((page) => {
              return {
                ...page,
                data: page.data.filter((c) => c.user.fid !== cast.user.fid),
              };
            }),
          };
        },
      );
    }
  }, [cast.user.fid, queryClient, queryKey]);

  const handleUnmute = useCallback(async () => {
    await unmuteUser(cast.user.fid);
  }, [cast.user.fid]);

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute ${
          cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
        }`}
        color="$mauve12"
        onPress={handleUnmute}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute ${
        cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
      }`}
      onPress={handleMute}
      closeMenu={closeMenu}
    />
  );
};

const MuteChannel = ({
  cast,
  closeMenu,
  queryKey,
}: { cast: FarcasterCast; closeMenu?: () => void; queryKey?: string[] }) => {
  const { session, settings } = useAuth();
  const queryClient = useQueryClient();

  if (!cast.channel) {
    return null;
  }

  const isMuted = settings?.mutedChannels.includes(cast.channel.url);

  const handleMute = useCallback(async () => {
    if (!cast.channel) return;
    await muteChannel(cast.channel.url);
    if (queryKey) {
      queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
        queryKey,
        (data) => {
          if (!data) return;
          return {
            ...data,
            pages: data.pages.map((page) => {
              return {
                ...page,
                data: page.data.filter(
                  (c) => c.channel?.url !== cast.channel?.url,
                ),
              };
            }),
          };
        },
      );
    }
  }, [cast.channel, queryClient, queryKey]);

  const handleUnmute = useCallback(async () => {
    if (!cast.channel) return;
    await unmuteChannel(cast.channel.url);
  }, [cast.channel]);

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute /${cast.channel?.channelId}`}
        color="$mauve12"
        onPress={handleUnmute}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute /${cast.channel?.channelId}`}
      onPress={handleMute}
      closeMenu={closeMenu}
    />
  );
};

const ViewCastEngagements = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  const router = useRouter();
  return (
    <KebabMenuItem
      Icon={BarChart2}
      title="View cast engagements"
      onPress={() => router.push(`/casts/${cast.hash}/likes`)}
      closeMenu={closeMenu}
    />
  );
};
