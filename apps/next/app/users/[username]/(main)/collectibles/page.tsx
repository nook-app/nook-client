import { fetchUser } from "@nook/app/api/farcaster";
import { UserFilterType } from "@nook/common/types";
import { notFound } from "next/navigation";
import { NftFeed } from "@nook/app/features/nft/nft-feed";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) {
    return notFound();
  }
  return (
    <NftFeed
      filter={{
        users: {
          type: UserFilterType.FID,
          data: {
            fid: user.fid,
          },
        },
      }}
    />
  );
}
