import { Button, ButtonProps, TamaguiElement } from "@nook/app-ui";
import { router } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { forwardRef } from "react";

export const IconButton = forwardRef<
  TamaguiElement,
  { icon: ButtonProps["icon"]; onPress?: () => void }
>(
  (
    { icon, onPress }: { icon: ButtonProps["icon"]; onPress?: () => void },
    ref,
  ) => (
    <Button
      ref={ref}
      icon={icon}
      width="$2.5"
      height="$2.5"
      padding="$0"
      borderRadius="$10"
      scaleIcon={1.25}
      onPress={onPress}
      backgroundColor="rgba(0,0,0,0.25)"
      color="white"
    />
  ),
);

IconButton.displayName = "IconButton";

export const BackButton = () => {
  return <IconButton icon={ArrowLeft} onPress={router.back} />;
};
