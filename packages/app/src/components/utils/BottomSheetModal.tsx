import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
  BottomSheetModal as BaseBottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";

export const BottomSheetModal = ({
  open,
  onClose,
  children,
  enableDynamicSizing,
  snapPoints,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  enableDynamicSizing?: boolean;
  snapPoints?: string[];
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [open]);

  const bottomSheetModalRef = useRef<BaseBottomSheetModal>(null);

  const memoSnapPoints = useMemo(() => snapPoints || ["50%"], [snapPoints]);

  const containerComponent = useCallback(
    ({ children }: { children?: ReactNode }) => (
      <FullWindowOverlay>{children}</FullWindowOverlay>
    ),
    [],
  );

  return (
    <BaseBottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={memoSnapPoints}
      enableDynamicSizing={enableDynamicSizing}
      animateOnMount
      containerComponent={containerComponent}
      onChange={(index) => {
        if (index === -1) {
          onClose();
        }
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          onPress={() => {
            onClose();
            bottomSheetModalRef.current?.close();
          }}
        />
      )}
      backgroundStyle={{
        backgroundColor: theme.background.val,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.backgroundStrong.val,
      }}
    >
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>
        {children}
      </BottomSheetView>
    </BaseBottomSheetModal>
  );
};
