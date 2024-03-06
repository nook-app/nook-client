import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useCast } from "@/hooks/useCast";
import { farcasterApi } from "@/store/apis/farcasterApi";
import { Heart } from "@tamagui/lucide-icons";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button, Text, View, useTheme } from "tamagui";
import * as Haptics from "expo-haptics";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useModal } from "@/hooks/useModal";
import { ModalName } from "@/modals/types";
import { likeCast, unlikeCast } from "@/store/slices/cast";
import { useUser } from "@/hooks/useUser";
import { followUser, unfollowUser } from "@/store/slices/user";

export const FarcasterUserFollowButton = ({ id }: { id: string }) => {
  const signerEnabled = useAppSelector((state) => state.auth.signerEnabled);
  const { open } = useModal(ModalName.EnableSigner);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useUser(id);

  const onPress = useCallback(() => {
    if (!user.context) return;
    if (!signerEnabled) {
      open();
      return;
    }
    if (user.context.following) {
      dispatch(
        farcasterApi.endpoints.unfollowUser.initiate({
          fid: user.fid,
        }),
      );
      dispatch(
        unfollowUser({
          id,
        }),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      dispatch(
        farcasterApi.endpoints.followUser.initiate({
          fid: user.fid,
        }),
      );
      dispatch(
        followUser({
          id,
        }),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [user, id, dispatch, signerEnabled, open]);

  return user.context?.following ? (
    <Button
      size="$3"
      variant="outlined"
      borderColor="$backgroundHover"
      onPress={onPress}
    >
      Unfollow
    </Button>
  ) : (
    <Button size="$3" onPress={onPress}>
      Follow
    </Button>
  );
};
