import { useAppSelector } from "./useAppSelector";
import { selectCastById } from "@/store/slices/cast";

export const useCast = (hash: string) => {
  const cast = useAppSelector((state) => selectCastById(state, hash));

  return cast;
};
