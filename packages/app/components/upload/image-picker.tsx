import { View } from "@nook/app-ui";
import { ReactNode, useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileCount = Math.min(files.length, limit);
    const newFiles: ImagePickerFile[] = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          newFiles.push({
            file: (e.target.result as string).split(",")[1],
            type: file.type,
          });
        }
        if (newFiles.length === fileCount) {
          onSelect(newFiles);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <View
      onPress={(e) => {
        e.stopPropagation();
        fileInputRef.current?.click();
      }}
      cursor="pointer"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={limit > 1}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />
      {children}
    </View>
  );
};
