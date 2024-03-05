import { useCallback } from "react";
import { useAppSelector } from "./useAppSelector";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useAppDispatch } from "./useAppDispatch";
import { setActiveNook, setActiveShelf } from "@/store/slices/auth";
import { selectNookById } from "@/store/slices/nook";

export const useNooks = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const nooks = useAppSelector((state) => state.auth.nooks);
  const activeShelves = useAppSelector((state) => state.auth.activeShelves);

  const storedActiveNookId = useAppSelector((state) => state.auth.activeNook);
  const activeNook = useAppSelector((state) =>
    storedActiveNookId ? selectNookById(state, storedActiveNookId) : nooks[0],
  );
  const activeNookId = activeNook?.id;
  const activeShelf =
    activeNook?.metadata.shelves.find(
      (s) => s.id === activeShelves[activeNookId],
    ) || activeNook?.metadata.shelves[0];

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

export const useNook = (nookId?: string, shelfId?: string) => {
  const { nooks, activeNook } = useNooks();

  const nook = nooks.find((n) => n.id === nookId) || activeNook;
  const shelf =
    nook?.metadata.shelves.find((s) => s.id === shelfId) ||
    nook?.metadata.shelves[0];

  return {
    nook,
    shelf,
  };
};
