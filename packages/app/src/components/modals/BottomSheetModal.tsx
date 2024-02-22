import {
  BottomSheetModal as BaseModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Keyboard,
  StyleProp,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { BottomSheetModalProps } from "./BottomSheetModalProps";
import { useKeyboardLayout } from "@/hooks/useKeyboardLayout";
import { View, useMedia, useTheme } from "tamagui";
import { isAndroid, isIos } from "@tamagui/constants";
import { BottomSheetContextProvider } from "./BottomSheetContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDeviceDimensions } from "@/hooks/useDeviceDimensions";

function useModalBackHandler(
  modalRef: React.RefObject<BaseModal>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (enabled) {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          modalRef.current?.close();
          return true;
        },
      );

      return subscription.remove;
    }
  }, [modalRef, enabled]);
}

const BACKDROP_APPEARS_ON_INDEX = 0;
const DISAPPEARS_ON_INDEX = -1;
const DRAG_ACTIVATION_OFFSET = 40;

export function BottomSheetModal({
  children,
  onClose,
  snapPoints: providedSnapPoints,
  stackBehavior = "push",
  animatedPosition: providedAnimatedPosition,
  containerComponent,
  footerComponent,
  fullScreen,
  hideHandlebar,
  enableDynamicSizing,
  blurredBackground = false,
  dismissOnBackPress = true,
  isDismissible = true,
  overrideInnerContainer = false,
  renderBehindTopInset = false,
  renderBehindBottomInset = false,
  hideKeyboardOnDismiss = false,
  hideKeyboardOnSwipeDown = false,
  extendOnKeyboardVisible = false,
}: BottomSheetModalProps): JSX.Element {
  const colorScheme = useColorScheme();
  const dimensions = useDeviceDimensions();
  const insets = useSafeAreaInsets();
  const media = useMedia();
  const keyboard = useKeyboardLayout();

  const theme = useTheme();
  const backgroundColor = theme.background.val;

  const modalRef = useRef<BaseModal>(null);
  const internalAnimatedPosition = useSharedValue(0);
  const [isSheetReady, setIsSheetReady] = useState(false);

  const snapPoints = useMemo(
    () => providedSnapPoints ?? (fullScreen ? ["100%"] : undefined),
    [providedSnapPoints, fullScreen],
  );

  useModalBackHandler(modalRef, isDismissible && dismissOnBackPress);

  useEffect(() => {
    modalRef.current?.present();
    // Close modal when it is unmounted
    return modalRef.current?.close;
  }, []);

  useEffect(() => {
    if (extendOnKeyboardVisible && keyboard.isVisible) {
      modalRef.current?.expand();
    }
  }, [extendOnKeyboardVisible, keyboard.isVisible]);

  const animatedPosition = providedAnimatedPosition ?? internalAnimatedPosition;

  const backgroundColorValue = blurredBackground
    ? "transparent"
    : backgroundColor;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={BACKDROP_APPEARS_ON_INDEX}
        disappearsOnIndex={DISAPPEARS_ON_INDEX}
        opacity={blurredBackground ? 0.2 : 0.4}
        pressBehavior={isDismissible ? "close" : "none"}
      />
    ),
    [blurredBackground, isDismissible],
  );

  const animatedBorderRadius = useAnimatedStyle(() => {
    const interpolatedRadius = interpolate(
      animatedPosition.value,
      [0, insets.top],
      [0, borderRadius ?? 24],
      Extrapolate.CLAMP,
    );
    return {
      borderTopLeftRadius: interpolatedRadius,
      borderTopRightRadius: interpolatedRadius,
    };
  });

  const renderBlurredBg = useCallback(
    () => (
      <Animated.View style={[blurViewStyle.base, animatedBorderRadius]}>
        {isIos ? (
          <BlurView
            intensity={90}
            style={blurViewStyle.base}
            tint={colorScheme === "dark" ? "dark" : "light"}
          />
        ) : (
          <View flexGrow={1} flex={1} backgroundColor="$surface2" />
        )}
      </Animated.View>
    ),
    [colorScheme, animatedBorderRadius],
  );

  // onAnimate is called when the sheet is about to animate to a new position.
  // `About to` is crucial here, because we want to trigger these actions as soon as possible.
  // See here: https://gorhom.github.io/react-native-bottom-sheet/props#onanimate
  const onAnimate = useCallback(
    // We want to start hiding the keyboard during the process of hiding the sheet.
    (fromIndex: number, toIndex: number): void => {
      if (
        (hideKeyboardOnDismiss && toIndex === DISAPPEARS_ON_INDEX) ||
        (hideKeyboardOnSwipeDown && toIndex < fromIndex)
      ) {
        Keyboard.dismiss();
      }

      // When a sheet has too much content it can lag and take a while to begin opening, so we want to delay rendering some of the content until the sheet is ready.
      // We consider the sheet to be "ready" as soon as it starts animating from the bottom to the top.
      // We add a short delay given that this callback is called when the sheet is "about to" animate.
      if (!isSheetReady && fromIndex === -1 && toIndex === 0) {
        setTimeout(() => setIsSheetReady(true), 50);
      }
    },
    [hideKeyboardOnDismiss, hideKeyboardOnSwipeDown, isSheetReady],
  );

  // on screens < xs (iPhone SE), assume no rounded corners on screen and remove rounded corners from fullscreen modal
  const borderRadius = media.short ? 0 : 24;

  const hiddenHandlebarStyle = {
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
  };

  const background = blurredBackground
    ? { backgroundComponent: renderBlurredBg }
    : undefined;
  const backdrop = { backdropComponent: renderBackdrop };

  const backgroundStyle = {
    backgroundColor: backgroundColorValue,
  };

  const bottomSheetViewStyles: StyleProp<ViewStyle> = [
    { backgroundColor: backgroundColorValue },
  ];

  const handleBarHeight = hideHandlebar ? 0 : 32;
  let fullContentHeight = dimensions.fullHeight - insets.top - handleBarHeight;

  if (renderBehindTopInset) {
    bottomSheetViewStyles.push(bottomSheetStyle.behindInset);
    if (hideHandlebar) {
      bottomSheetViewStyles.push(animatedBorderRadius);
    }
    fullContentHeight += insets.top;
  } else if (hideHandlebar) {
    bottomSheetViewStyles.push(hiddenHandlebarStyle);
  }
  if (!renderBehindBottomInset) {
    bottomSheetViewStyles.push({ paddingBottom: insets.bottom });
  }
  // Add the calculated height only if the sheet is full screen
  // (otherwise, rely on the dynamic sizing of the sheet)
  if (fullScreen) {
    bottomSheetViewStyles.push({ height: fullContentHeight });
  }

  return (
    <BaseModal
      {...background}
      {...backdrop}
      ref={modalRef}
      // This is required for android to make scrollable containers work
      // and allow closing the modal by dragging the content
      // (adding this property on iOS breaks closing the modal by dragging the content)
      activeOffsetY={
        isAndroid
          ? [-DRAG_ACTIVATION_OFFSET, DRAG_ACTIVATION_OFFSET]
          : undefined
      }
      animatedPosition={animatedPosition}
      backgroundStyle={backgroundStyle}
      containerComponent={containerComponent}
      enableContentPanningGesture={isDismissible}
      enableDynamicSizing={!snapPoints || enableDynamicSizing}
      enableHandlePanningGesture={isDismissible}
      footerComponent={footerComponent}
      snapPoints={snapPoints}
      stackBehavior={stackBehavior}
      topInset={renderBehindTopInset ? 0 : insets.top}
      onAnimate={onAnimate}
      onDismiss={onClose}
    >
      <BottomSheetContextProvider isSheetReady={isSheetReady}>
        {overrideInnerContainer ? (
          children
        ) : (
          <BottomSheetView style={bottomSheetViewStyles}>
            {children}
          </BottomSheetView>
        )}
      </BottomSheetContextProvider>
    </BaseModal>
  );
}

const bottomSheetStyle = StyleSheet.create({
  behindInset: {
    overflow: "hidden",
  },
  detached: {
    marginHorizontal: 12,
  },
  modalTransparent: {
    backgroundColor: "transparent",
    borderRadius: 0,
  },
});

const blurViewStyle = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
