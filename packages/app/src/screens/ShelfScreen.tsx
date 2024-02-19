import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { SwipeablePanels } from "@/components/shelves/SwipeablePanels";
import { selectNookById } from "@/store/slices/nook";
import { useEffect } from "react";
import { store } from "@/store";
import { nookApi } from "@/store/apis/nookApi";
import { Spinner, View } from "tamagui";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { EntityModal } from "@/modals/EntityModal";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setActiveNook } from "@/store/slices/user";

export default function ShelfScreen() {
  const {
    params: { nookId, shelfId },
  } = useRoute<RouteProp<RootStackParamList, "Shelf">>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const storedNook = nookId
    ? selectNookById(store.getState(), nookId)
    : undefined;
  const theme = useAppSelector((state) => state.user.theme);
  const { data: fetchedNook } = nookApi.useGetNookQuery(nookId, {
    skip: !!storedNook,
  });
  const activeNook = storedNook || fetchedNook;

  const activeShelf =
    activeNook?.shelves.find((shelf) => shelf.slug === shelfId) ||
    activeNook?.shelves[0];

  useEffect(() => {
    navigation.setOptions({
      title: activeShelf?.name || "",
    });
  }, [activeShelf, navigation]);

  if (!activeShelf) {
    return (
      <View
        padding="$3"
        alignItems="center"
        backgroundColor="$background"
        justifyContent="center"
        height="100%"
        theme={theme}
      />
    );
  }

  return (
    <View backgroundColor="$background" height="100%" theme={theme}>
      <SwipeablePanels key={activeShelf.slug} panels={activeShelf.panels} />
      <EntityModal />
    </View>
  );
}
