import { Link } from "@tamagui/lucide-icons";
import { NamedExoticComponent, useCallback } from "react";
import { View, useToastController } from "@nook/app-ui";
import { useMenu } from "./context";
import { MenuItem } from "./menu-item";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";
import { useUser } from "../../hooks/api/users";
import { CdnAvatar } from "../cdn-avatar";

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
  image,
  title,
}: {
  link: string;
  Icon?: NamedExoticComponent | JSX.Element;
  image?: JSX.Element;
  title: string;
}) => {
  const { close } = useMenu();

  const handlePress = useCallback(() => {
    Linking.openURL(link);
    close();
  }, [link, close]);

  return (
    <MenuItem
      Icon={!image && !Icon ? Link : Icon}
      image={image}
      title={title}
      onPress={handlePress}
    />
  );
};

export const OpenWarpcast = ({
  link,
}: {
  link: string;
}) => {
  const { data } = useUser("9152");
  return (
    <OpenLink
      link={link}
      image={
        <View minWidth="$0.9">
          <CdnAvatar size="$0.9" src={data?.pfp} />
        </View>
      }
      title="View on Warpcast"
    />
  );
};
