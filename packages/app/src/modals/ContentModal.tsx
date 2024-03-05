import { useContent } from "@/hooks/useContent";
import { Embed } from "@/components/embeds/Embed";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { ModalName } from "./types";
import { useModal } from "@/hooks/useModal";
import { View } from "tamagui";

export const ContentModal = () => {
  const { close, state } = useModal(ModalName.Content);
  const content = useContent(state?.uri || "");

  console.log(content);

  return (
    <BottomSheetModal onClose={close} fullScreen blurredBackground>
      <View height="100%" justifyContent="center">
        <Embed content={content} disableLink />
      </View>
    </BottomSheetModal>
  );
};
