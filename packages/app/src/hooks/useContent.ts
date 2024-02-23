import { Content, PostData } from "@nook/common/types";
import { useAppSelector } from "./useAppSelector";
import { selectContentById } from "@/store/slices/content";

export const useContent = (contentId?: string) => {
  const content = useAppSelector((state) =>
    contentId ? selectContentById(state, contentId) : undefined,
  );

  return content as Content<PostData>;
};
