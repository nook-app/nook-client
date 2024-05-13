import { Image, Link } from "@tamagui/lucide-icons";
import { NamedExoticComponent, useCallback } from "react";
import { useToastController } from "@nook/app-ui";
import { useMenu } from "./context";
import { MenuItem } from "./menu-item";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

export const CopyLink = ({ link }: { link: string }) => {
  const toast = useToastController();
  const { close } = useMenu();

  const handlePress = useCallback(() => {
    Clipboard.setStringAsync(link);
    toast.show("Link copied");
    close();
  }, [link, close, toast]);

  return <MenuItem Icon={Link} title="Copy link" onPress={handlePress} />;
};

export const OpenLink = ({
  link,
  Icon,
  title,
}: {
  link: string;
  Icon: NamedExoticComponent | JSX.Element;
  title: string;
}) => {
  const { close } = useMenu();

  const handlePress = useCallback(() => {
    Linking.openURL(link);
    close();
  }, [link, close]);

  return <MenuItem Icon={Image} title="Share image" onPress={handlePress} />;
};
