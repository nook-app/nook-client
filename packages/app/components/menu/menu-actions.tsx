import { Link } from "@tamagui/lucide-icons";
import { NamedExoticComponent, useCallback } from "react";
import { Image, useToastController } from "@nook/app-ui";
import { useMenu } from "./context";
import { MenuItem } from "./menu-item";

export const CopyLink = ({ link }: { link: string }) => {
  const toast = useToastController();
  const { close } = useMenu();

  const handlePress = useCallback(() => {
    navigator.clipboard.writeText(link);
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
    window.open(link);
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
  return (
    <OpenLink
      link={link}
      Icon={<Image source={{ uri: "/warpcast.svg" }} width={14} height={14} />}
      title="View on Warpcast"
    />
  );
};
