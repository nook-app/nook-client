import { selectContentById } from "@/store/slices/content";
import { useAppSelector } from "./useAppSelector";

export const useContent = (uri: string) => {
  const content = useAppSelector((state) => selectContentById(state, uri));

  return content;
};
