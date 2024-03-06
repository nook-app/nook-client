import { farcasterApi } from "@/store/apis/farcasterApi";
import { useAppSelector } from "./useAppSelector";
import { selectCastById } from "@/store/slices/cast";

export const useCast = (hash: string) => {
  const storedCast = useAppSelector((state) => selectCastById(state, hash));
  const { data: fetchedCast } = farcasterApi.useGetCastQuery(hash, {
    skip: !!storedCast,
  });

  return storedCast || fetchedCast;
};
