import { ContentPost } from "@/components/content/ContentPost";
import { ContentReply } from "@/components/content/ContentReply";
import { useContent } from "@/hooks/useContent";
import { RootStackParamList } from "@/types";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "tamagui";

export default function ContentScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "Content">>();
  const content = useContent(route.params.contentId);

  return (
    <View backgroundColor="$background" height="100%">
      {content?.content.type === "POST" && (
        <ContentPost contentId={route.params.contentId} />
      )}
      {content?.content.type === "REPLY" && (
        <ContentReply contentId={route.params.contentId} />
      )}
    </View>
  );
}
