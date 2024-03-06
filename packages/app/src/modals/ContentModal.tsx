import { useContent } from "@/hooks/useContent";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { ModalName } from "./types";
import { useModal } from "@/hooks/useModal";
import { View } from "tamagui";
import React from "react";
import {
  PinchGestureHandler,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

export const ContentModal = () => {
  const { close, state } = useModal(ModalName.Content);
  const content = useContent(state?.uri || "");

  return (
    <BottomSheetModal onClose={close} fullScreen blurredBackground>
      <View height="100%" justifyContent="center">
        <InteractiveImage
          source={{ uri: content?.uri || "" }}
          onClose={close}
        />
      </View>
    </BottomSheetModal>
  );
};

const InteractiveImage = ({
  source,
  onClose,
}: { source: { uri: string }; onClose: () => void }) => {
  const scale = useSharedValue(1);
  const deviceWidth = Dimensions.get("window").width;
  const deviceHeight = Dimensions.get("window").height;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const onPinchGestureEvent = useAnimatedGestureHandler<
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    { focalX: number; focalY: number; nativeEvent: any },
    {
      startX: number;
      startY: number;
      initialFocalX: number;
      initialFocalY: number;
    }
  >({
    onStart: (event, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      context.initialFocalX = event.focalX;
      context.initialFocalY = event.focalY;
    },
    onActive: (event, context) => {
      scale.value = event.scale;

      const focalXDiff = event.focalX - context.initialFocalX;
      const focalYDiff = event.focalY - context.initialFocalY;

      translateX.value = context.startX + focalXDiff * (1 - event.scale);
      translateY.value = context.startY + focalYDiff * (1 - event.scale);
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const onPanGestureEvent = useAnimatedGestureHandler<
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    { focalX: number; focalY: number; nativeEvent: any },
    {
      startX: number;
      startY: number;
      initialFocalX: number;
      initialFocalY: number;
    }
  >({
    onStart: (event, context) => {
      context.startY = translateY.value;
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const panSpeedReductionFactor = 1 / scale.value;
      translateY.value =
        context.startY + event.translationY * panSpeedReductionFactor;
      translateX.value =
        context.startX + event.translationX * panSpeedReductionFactor;
    },
    onEnd: (event, context) => {
      const closeThreshold = 100;
      if (Math.abs(event.translationY / scale.value) > closeThreshold) {
        runOnJS(onClose)();
      } else {
        if (translateX.value > deviceWidth / scale.value / 2) {
          translateX.value = withSpring(
            -(deviceWidth / 2 / scale.value - deviceWidth / 2),
          );
        } else if (translateX.value < -deviceWidth / scale.value / 2) {
          translateX.value = withSpring(
            deviceWidth / 2 / scale.value - deviceWidth / 2,
          );
        }
        if (translateY.value > deviceHeight / scale.value / 2) {
          translateY.value = withSpring(
            -(deviceHeight / 2 / scale.value - deviceHeight / 2),
          );
        } else if (translateY.value < -deviceHeight / scale.value / 2) {
          translateY.value = withSpring(
            deviceHeight / 2 / scale.value - deviceHeight / 2,
          );
        }
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <PanGestureHandler
      /* @ts-ignore */
      onGestureEvent={onPanGestureEvent}
    >
      <Animated.View>
        {/* @ts-ignore */}
        <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
          <Animated.View style={{ height: "100%", width: "100%" }}>
            <Animated.Image
              source={source}
              style={[{ height: "100%", width: "100%" }, animatedStyle]}
              resizeMode="contain"
            />
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default InteractiveImage;
