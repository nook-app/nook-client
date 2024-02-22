import { BottomSheetModal as BaseModal } from "@gorhom/bottom-sheet";
import { ComponentProps, PropsWithChildren } from "react";
import { SharedValue } from "react-native-reanimated";

export type BottomSheetModalProps = PropsWithChildren<{
  animatedPosition?: SharedValue<number>;
  hideHandlebar?: boolean;
  enableDynamicSizing?: boolean;
  onClose?: () => void;
  snapPoints?: Array<string | number>;
  stackBehavior?: ComponentProps<typeof BaseModal>["stackBehavior"];
  containerComponent?: ComponentProps<typeof BaseModal>["containerComponent"];
  footerComponent?: ComponentProps<typeof BaseModal>["footerComponent"];
  fullScreen?: boolean;
  blurredBackground?: boolean;
  dismissOnBackPress?: boolean;
  isDismissible?: boolean;
  overrideInnerContainer?: boolean;
  renderBehindTopInset?: boolean;
  renderBehindBottomInset?: boolean;
  hideKeyboardOnDismiss?: boolean;
  hideKeyboardOnSwipeDown?: boolean;
  extendOnKeyboardVisible?: boolean;
  isModalOpen?: boolean;
  isCentered?: boolean;
}>;
