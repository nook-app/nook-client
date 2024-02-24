import { Spinner, Text, View } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { EventActionType, TopicType } from "@nook/common/types";
import { EntityListPanel } from "@/components/panels/EntityListPanel";

export const EntityFollowingModal = () => {
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.EntityFollowing],
  );
  const { close } = useModal(ModalName.EntityFollowing);

  return (
    <BottomSheetModal
      onClose={close}
      snapPoints={["70%", "90%"]}
      overrideInnerContainer
    >
      <View paddingHorizontal="$2" alignItems="center">
        <Text fontWeight="700">Following</Text>
      </View>
      {initialState ? (
        <EntityListPanel
          args={{
            filter: {
              type: EventActionType.FOLLOW,
              topics: {
                type: TopicType.SOURCE_ENTITY,
                value: initialState.entityId,
              },
            },
            sort: "timestamp",
          }}
          entityField="data.targetEntityId"
          isBottomSheet
        />
      ) : (
        <Spinner />
      )}
    </BottomSheetModal>
  );
};
