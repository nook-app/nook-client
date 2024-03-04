import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useEffect } from "react";
import { Spinner, View } from "tamagui";
import { Panels } from "@/components/panels/Panels";
import { useNook } from "@/hooks/useNooks";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const NookScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, "Nook">>();
  const navigation = useNavigation();
  const { nook, shelf } = useNook(params.nookId, params.shelfId);

  useEffect(() => {
    navigation.setOptions({
      title: shelf?.name || "",
    });
  }, [shelf, navigation]);

  if (!nook || !shelf) {
    return (
      <View
        padding="$3"
        alignItems="center"
        backgroundColor="$background"
        justifyContent="center"
        height="100%"
      >
        <Spinner size="large" paddingTop="$5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View backgroundColor="$background" height="100%">
        <Panels panels={shelf.panels} key={`${nook.id}-${shelf.id}`} />
      </View>
    </GestureHandlerRootView>
  );
};
