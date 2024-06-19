import { getServerSession } from "@nook/app/server/session";
import { notFound } from "next/navigation";
import { fetchList } from "@nook/app/api/list";
import { TabNavigation } from "@nook/app/features/tabs";
import { ListType } from "@nook/common/types";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { listId: string } }) {
  const session = await getServerSession();
  if (!session) return notFound();

  const list = await fetchList(params.listId);
  if (list.creatorId !== session.id) return notFound();

  const tabs = [
    {
      id: "search",
      label: "Search",
      href: `/lists/${params.listId}/settings/items`,
    },
  ];

  if (list.type === ListType.USERS) {
    tabs.push({
      id: "users",
      label: "Users",
      href: `/lists/${params.listId}/settings/items/manage`,
    });
  } else {
    tabs.push({
      id: "channels",
      label: "Channels",
      href: `/lists/${params.listId}/settings/items/manage`,
    });
  }

  return <TabNavigation tabs={tabs}>{children}</TabNavigation>;
}
