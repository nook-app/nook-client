import { Button, ButtonProps } from "@nook/app-ui";
import { router } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";

export const IconButton = ({
  icon,
  onPress,
}: { icon: ButtonProps["icon"]; onPress?: () => void }) => (
  <Button
    icon={icon}
    width="$2.5"
    height="$2.5"
    padding="$0"
    borderRadius="$10"
    scaleIcon={1.25}
    onPress={onPress}
    backgroundColor="rgba(0,0,0,0.25)"
  />
);

export const BackButton = () => {
  return <IconButton icon={ArrowLeft} onPress={router.back} />;
};
