import { PostData } from "@nook/common/types";
import { useAppSelector } from "./useAppSelector";
import { selectContentById } from "@/store/slices/content";
import { ContentWithContext } from "@nook/api/types";

export const useContent = (contentId?: string) => {
  const content = useAppSelector((state) =>
    contentId ? selectContentById(state, contentId) : undefined,
  );

  return content as ContentWithContext<PostData> | undefined;
};
