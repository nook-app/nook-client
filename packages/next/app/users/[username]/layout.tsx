import { fetchUser } from "@nook/app/api/farcaster";
import { UserSidebar } from "@nook/app/features/farcaster/user-profile/user-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { username: string } },
  parent: ResolvingMetadata,
): Promise<Metadata | ResolvingMetadata> {
  const user = await fetchUser(params.username);
  if (!user) return parent;

  return {
    title: user.displayName
      ? `${user.displayName} (@${user.username})`
      : `@${user.username}`,
    description: user.bio,
    openGraph: {
      title: user.displayName
        ? `${user.displayName} (@${user.username})`
        : `@${user.username}`,
      description: user.bio,
      images: [
        {
          url: user.pfp || "banner.png",
          alt: user.displayName || `@${user.username}`,
        },
      ],
    },
    manifest: "/manifest.json",
  };
}

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  return (
    <PageNavigation sidebar={<UserSidebar user={user} />}>
      <NavigationHeader title={user.displayName || `@${user.username}`} />
      {children}
    </PageNavigation>
  );
}
