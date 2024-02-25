import { useCallback } from "react";
import { useAppSelector } from "./useAppSelector";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useAppDispatch } from "./useAppDispatch";
import { setActiveNook, setActiveShelf } from "@/store/slices/user";
import { selectNookById } from "@/store/slices/nook";

export const useNooks = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const nooks = useAppSelector((state) => state.user.nooks);
  const activeShelves = useAppSelector((state) => state.user.activeShelves);

  const storedActiveNookId = useAppSelector((state) => state.user.activeNook);
  const activeNook = useAppSelector((state) =>
    storedActiveNookId ? selectNookById(state, storedActiveNookId) : nooks[0],
  );
  const activeNookId = activeNook?.nookId;
  const activeShelf =
    activeNook?.shelves.find((s) => s.slug === activeShelves[activeNookId]) ||
    activeNook?.shelves[0];

  const navigateToNook = useCallback(
    (nookId: string) => {
      navigation.navigate("Nook", { nookId, shelfId: activeShelves[nookId] });
      dispatch(setActiveNook(nookId));
    },
    [navigation, dispatch, activeShelves],
  );

  const navigateToShelf = useCallback(
    (shelfId: string) => {
      navigation.navigate("Nook", { nookId: activeNookId, shelfId });
      dispatch(setActiveShelf({ nookId: activeNookId, shelfId }));
    },
    [navigation, dispatch, activeNookId],
  );

  return {
    nooks,
    navigateToNook,
    navigateToShelf,
    activeNook,
    activeShelf,
  };
};
