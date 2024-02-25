import { Spinner, Text, View } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { EventActionType, TopicType } from "@nook/common/types";
import { EntityListPanel } from "@/components/panels/EntityListPanel";

export const ContentRepostsModal = () => {
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.ContentReposts],
  );
  const { close } = useModal(ModalName.ContentReposts);

  return (
    <BottomSheetModal
      onClose={close}
      snapPoints={["70%", "90%"]}
      overrideInnerContainer
    >
      <View paddingHorizontal="$2" alignItems="center">
        <Text fontWeight="700">Reposts</Text>
      </View>
      {initialState ? (
        <EntityListPanel
          args={{
            filter: {
              type: EventActionType.REPOST,
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
