import { View } from "@nook/app-ui";
import { useCreateCast } from "./context";
import {
  ImagePicker,
  ImagePickerFile,
} from "../../../components/upload/image-picker";
import { Image } from "@tamagui/lucide-icons";

export const UploadImageButton = () => {
  const { uploadImages, activeEmbedLimit, activeIndex } = useCreateCast();

  const handleImageSelect = async (files: ImagePickerFile[]) => {
    if (files.length === 0) return;
    uploadImages(
      activeIndex,
      files.map((file) => file.file),
    );
  };

  return (
    <ImagePicker onSelect={handleImageSelect} limit={activeEmbedLimit}>
      <View
        cursor="pointer"
        width="$3"
        height="$3"
        justifyContent="center"
        alignItems="center"
        borderRadius="$10"
        hoverStyle={{
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
          backgroundColor: "$color3",
        }}
      >
        <Image size={24} color="$color12" />
      </View>
    </ImagePicker>
  );
};
