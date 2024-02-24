import { Spinner, Text, View } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { EventActionType, TopicType } from "@nook/common/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { EntityListPanel } from "@/components/panels/EntityListPanel";

export const ContentLikesModal = () => {
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.ContentLikes],
  );
  const { close } = useModal(ModalName.ContentLikes);

  return (
    <BottomSheetModal
      onClose={close}
      snapPoints={["70%", "90%"]}
      overrideInnerContainer
    >
      <View paddingHorizontal="$2" alignItems="center">
        <Text fontWeight="700">Likes</Text>
      </View>
      {initialState ? (
        <EntityListPanel
          args={{
            filter: {
              type: EventActionType.LIKE,
              topics: {
                type: TopicType.TARGET_CONTENT,
                value: initialState.contentId,
              },
            },
            sort: "timestamp",
          }}
          isBottomSheet
        />
      ) : (
        <Spinner />
      )}
    </BottomSheetModal>
  );
};
