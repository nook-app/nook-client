import { Button, ButtonProps } from "@nook/app-ui";

export const IconButton = ({
  icon,
  onPress,
}: { icon: ButtonProps["icon"]; onPress: () => void }) => (
  <Button
    icon={icon}
    width="$2"
    height="$2"
    padding="$0"
    borderRadius="$10"
    scaleIcon={1.25}
    onPress={onPress}
    backgroundColor="$shadowColor"
  />
);
