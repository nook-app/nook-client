import { Display, FarcasterFeedFilter } from "@nook/common/types";
import { FarcasterFilteredFeed } from "./filtered-feed";
import { fetchCastFeed } from "../../../api/farcaster";

export const FarcasterFilteredFeedServer = async ({
  api,
  filter,
  displayMode,
}: {
  api?: string;
  filter: FarcasterFeedFilter;
  displayMode?: Display;
}) => {
  const initialData = await fetchCastFeed({ api, filter });

  if (!initialData) {
    return <></>;
  }

  return (
    <FarcasterFilteredFeed
      api={api}
      filter={filter}
      initialData={initialData}
      displayMode={displayMode}
    />
  );
};
