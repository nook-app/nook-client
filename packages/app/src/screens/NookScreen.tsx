import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { selectNookById } from "@/store/slices/nook";
import { useEffect } from "react";
import { store } from "@/store";
import { nookApi } from "@/store/apis/nookApi";
import { Spinner, View } from "tamagui";
import { Panels } from "@/components/panels/Panels";

export const NookScreen = () => {
  const {
    params: { nookId, shelfId },
  } = useRoute<RouteProp<RootStackParamList, "Nook">>();
  const navigation = useNavigation();

  const storedNook = nookId
    ? selectNookById(store.getState(), nookId)
    : undefined;
  const { data: fetchedNook } = nookApi.useGetNookQuery(
    { nookId },
    {
      skip: !!storedNook,
    },
  );
  const activeNook = storedNook || fetchedNook;

  const activeShelf =
    activeNook?.shelves.find((shelf) => shelf.slug === shelfId) ||
    activeNook?.shelves[0];

  useEffect(() => {
    navigation.setOptions({
      title: activeShelf?.name || "",
    });
  }, [activeShelf, navigation]);

  if (!activeShelf || !activeNook) {
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
    <View backgroundColor="$background" height="100%">
      <Panels panels={activeShelf.panels} />
    </View>
  );
};
