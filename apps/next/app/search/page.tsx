import { redirect } from "next/navigation";
import { SearchHeader } from "@nook/app/features/search/search-header";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { ChannelSearchFeed } from "@nook/app/features/farcaster/channel-feed/channel-search-feed";
import { UserSearchFeed } from "@nook/app/features/farcaster/user-feed/user-search-feed";
import { searchChannels } from "@nook/app/api/farcaster/channels";
import { searchUsers } from "@nook/app/api/farcaster/users";

export default async function Search({
  searchParams,
}: { searchParams: { q: string; f?: string } }) {
  if (!searchParams.q) {
    return redirect("/explore");
  }

  return (
    <SearchHeader {...searchParams}>
      {(!searchParams.f || searchParams.f === "casts") && (
        <FarcasterFilteredFeedServer filter={{ text: [searchParams.q] }} />
      )}
      {searchParams.f === "users" && (
        <UserSearchFeedServer q={searchParams.q} />
      )}
      {searchParams.f === "channels" && (
        <ChannelSearchFeedServer q={searchParams.q} />
      )}
    </SearchHeader>
  );
}

async function ChannelSearchFeedServer({ q }: { q: string }) {
  const initialData = await searchChannels(q);
  return <ChannelSearchFeed q={q} initialData={initialData} />;
}

async function UserSearchFeedServer({ q }: { q: string }) {
  const initialData = await searchUsers(q);
  return <UserSearchFeed q={q} initialData={initialData} />;
}
