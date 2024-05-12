import { View } from "@nook/app-ui";
import { ReactNode, useRef } from "react";

export const ImagePicker = ({
  onSelect,
  children,
}: {
  onSelect: (url: string) => void;
  children: ReactNode;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]; // Get only the first file
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        onSelect((e.target.result as string).split(",")[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <View
      onPress={(e) => {
        fileInputRef.current?.click();
      }}
      cursor="pointer"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />
      {children}
    </View>
  );
};
