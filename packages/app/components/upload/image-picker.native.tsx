import { View } from "@nook/app-ui";
import { ReactNode } from "react";
import * as ExpoImagePicker from "expo-image-picker";
import { TouchableOpacity } from "react-native";

export const ImagePicker = ({
  onSelect,
  children,
}: {
  onSelect: (url: string) => void;
  children: ReactNode;
}) => {
  const handleImageSelect = async () => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
      selectionLimit: 1,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets) return;

    for (const asset of result.assets) {
      if (!asset.base64) continue;
      onSelect(asset.base64);
    }
  };

  return (
    <TouchableOpacity onPress={handleImageSelect}>{children}</TouchableOpacity>
  );
};
