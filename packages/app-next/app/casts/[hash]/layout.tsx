import { CastSidebar } from "@nook/app/features/farcaster/cast-screen/cast-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import { fetchCast } from "@nook/app/api/farcaster";
import { Metadata, ResolvingMetadata } from "next";
import { ReactNode } from "react";
import { NavigationHeader } from "../../../components/NavigationHeader";

export async function generateMetadata(
  { params }: { params: { hash: string } },
  parent: ResolvingMetadata,
): Promise<Metadata | ResolvingMetadata> {
  const cast = await fetchCast(params.hash);
  if (!cast) return parent;

  return {
    title: cast.user.displayName
      ? `${cast.user.displayName} (@${cast.user.username})`
      : `@${cast.user.username}`,
    description: cast.text,
    openGraph: {
      title: cast.user.displayName
        ? `${cast.user.displayName} (@${cast.user.username})`
        : `@${cast.user.username}`,
      description: cast.text,
      images: [
        {
          url: `https://client.warpcast.com/v2/og-image?castHash=${params.hash}`,
          alt: cast.user.displayName || `@${cast.user.username}`,
        },
      ],
    },
    manifest: "/manifest.json",
  };
}

export default async function Cast({
  children,
  params,
}: { children: ReactNode; params: { hash: string } }) {
  const cast = await fetchCast(params.hash);
  return (
    <PageNavigation sidebar={<CastSidebar cast={cast} />}>
      <NavigationHeader title="Cast" />
      {children}
    </PageNavigation>
  );
}
