import { ReactNode } from "react";
import * as ExpoImagePicker from "expo-image-picker";
import { TouchableOpacity } from "react-native";

export type ImagePickerFile = {
  file: string;
  type?: string;
  previewUri?: string;
};

export const ImagePicker = ({
  onSelect,
  children,
  limit = 1,
}: {
  onSelect: (files: ImagePickerFile[]) => void;
  children: ReactNode;
  limit?: number;
}) => {
  const handleImageSelect = async () => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      base64: true,
      selectionLimit: limit,
      allowsMultipleSelection: limit > 1,
    });

    if (result.canceled || !result.assets) return;

    const files: ImagePickerFile[] = [];
    for (const asset of result.assets) {
      if (!asset.base64) continue;
      files.push({
        file: asset.base64,
        type: asset.type,
        previewUri: asset.uri,
      });
    }
    onSelect(files);
  };

  return (
    <TouchableOpacity onPress={handleImageSelect}>{children}</TouchableOpacity>
  );
};
