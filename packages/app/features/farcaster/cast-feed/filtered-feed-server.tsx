import { fetchCastFeed } from "../../../server/feed";
import { Display, FarcasterFeedFilter } from "../../../types";
import { FarcasterFilteredFeed } from "./filtered-feed";

export const FarcasterFilteredFeedServer = async ({
  filter,
  displayMode,
}: {
  filter: FarcasterFeedFilter;
  displayMode?: Display;
}) => {
  const initialData = await fetchCastFeed(filter);
  return (
    <FarcasterFilteredFeed
      filter={filter}
      initialData={initialData}
      displayMode={displayMode}
    />
  );
};
