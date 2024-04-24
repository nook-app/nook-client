import { fetchUser } from "@nook/app/api/farcaster";
import { PageNavigation } from "../../../../components/PageNavigation";
import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { UserSidebar } from "@nook/app/features/farcaster/user-profile/user-sidebar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  return (
    <>
      <UserHeader username={params.username} />
      {children}
    </>
  );
}
