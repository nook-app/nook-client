import { getServerSession } from "@nook/app/server/auth";
import { notFound } from "next/navigation";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) return notFound();
  return <>{children}</>;
}
