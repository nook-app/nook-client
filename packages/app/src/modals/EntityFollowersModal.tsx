import { Spinner, Text, View } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { EventActionType, TopicType } from "@nook/common/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { EntityListPanel } from "@/components/panels/EntityListPanel";

export const EntityFollowersModal = () => {
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.EntityFollowers],
  );
  const { close } = useModal(ModalName.EntityFollowers);

  return (
    <BottomSheetModal
      onClose={close}
      snapPoints={["70%", "90%"]}
      overrideInnerContainer
    >
      <View paddingHorizontal="$2" alignItems="center">
        <Text fontWeight="700">Followers</Text>
      </View>
      {initialState ? (
        <EntityListPanel
          args={{
            filter: {
              type: EventActionType.FOLLOW,
              topics: {
                type: TopicType.TARGET_ENTITY,
                value: initialState.entityId,
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
