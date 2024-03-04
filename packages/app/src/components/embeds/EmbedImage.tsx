import { useModal } from "@/hooks/useModal";
import { ModalName } from "@/modals/types";
import { formatToWarpcastCDN } from "@/utils";
import { UrlContentResponse } from "@nook/common/types";
import { Image } from "expo-image";
import { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Image as TImage, View } from "tamagui";

export const EmbedImage = ({
  content: { uri },
  disableLink,
}: { content: UrlContentResponse; disableLink?: boolean }) => {
  const { open } = useModal(ModalName.Content);
  const [height, setHeight] = useState(0);

  const cdnUri = formatToWarpcastCDN(uri);

  return (
    <View
      borderRadius="$2"
      overflow="hidden"
      marginTop="$2"
      onLayout={({ nativeEvent }) => {
        if (cdnUri) {
          TImage.getSize(cdnUri, (w, h) => {
            if (w > 0) {
              setHeight((h / w) * nativeEvent.layout.width);
            }
          });
        }
      }}
    >
      <TouchableOpacity onPress={() => open({ uri })} disabled={disableLink}>
        <Image source={{ uri: cdnUri }} style={{ width: "100%", height }} />
      </TouchableOpacity>
    </View>
  );
};
