import { Spinner, Text, View } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { ContentFeedPanel } from "@/components/panels/ContentFeedPanel";
import { ContentType, TopicType } from "@nook/common/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export const ContentQuotesModal = () => {
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.ContentQuotes],
  );
  const { close } = useModal(ModalName.ContentQuotes);

  return (
    <BottomSheetModal
      onClose={close}
      snapPoints={["70%", "90%"]}
      overrideInnerContainer
    >
      <View paddingHorizontal="$2" alignItems="center">
        <Text fontWeight="700">Quotes</Text>
      </View>
      {initialState ? (
        <BottomSheetScrollView>
          <ContentFeedPanel
            args={{
              filter: {
                type: {
                  $in: [ContentType.POST, ContentType.REPLY],
                },
                topics: {
                  type: TopicType.SOURCE_EMBED,
                  value: initialState.contentId,
                },
              },
              sort: "engagement.likes",
            }}
            asList
          />
        </BottomSheetScrollView>
      ) : (
        <Spinner />
      )}
    </BottomSheetModal>
  );
};
