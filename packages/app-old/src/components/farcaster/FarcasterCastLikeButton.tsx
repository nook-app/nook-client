import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useCast } from "@/hooks/useCast";
import { farcasterApi } from "@/store/apis/farcasterApi";
import { Heart } from "@tamagui/lucide-icons";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View, useTheme } from "tamagui";
import * as Haptics from "expo-haptics";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useModal } from "@/hooks/useModal";
import { ModalName } from "@/modals/types";
import { likeCast, unlikeCast } from "@/store/slices/cast";

export const FarcasterCastLikeButton = ({
  hash,
  withAmount,
}: { hash: string; withAmount?: boolean }) => {
  const signerEnabled = useAppSelector((state) => state.auth.signerEnabled);
  const { open } = useModal(ModalName.EnableSigner);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const cast = useCast(hash);

  const onPress = useCallback(() => {
    if (!cast.context) return;
    if (!signerEnabled) {
      open();
      return;
    }
    if (cast.context.liked) {
      dispatch(
        farcasterApi.endpoints.unlikeCast.initiate({
          hash: cast.hash,
        }),
      );
      dispatch(unlikeCast({ hash: cast.hash }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      dispatch(
        farcasterApi.endpoints.likeCast.initiate({
          hash: cast.hash,
        }),
      );
      dispatch(likeCast({ hash: cast.hash }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [cast, dispatch, signerEnabled, open]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
        <Heart
          size={16}
          color={cast.context?.liked ? "$red9" : "$gray10"}
          fill={cast.context?.liked ? theme.$red9.val : theme.$background.val}
        />
        {withAmount && (
          <Text color="$gray10" fontSize="$4">
            {cast.engagement.likes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
