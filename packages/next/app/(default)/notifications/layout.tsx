import { getServerSession } from "@nook/app/server/auth";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { notFound } from "next/navigation";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) return notFound();
  return (
    <>
      <NavigationHeader title="Notifications" />
      {children}
    </>
  );
}
