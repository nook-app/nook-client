import { getServerSession } from "@nook/app/server/session";
import { notFound } from "next/navigation";
import { fetchList } from "@nook/app/api/list";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { listId: string } }) {
  const session = await getServerSession();
  if (!session) return notFound();

  const list = await fetchList(params.listId);
  if (list.creatorId !== session.id) return notFound();

  return <>{children}</>;
}
