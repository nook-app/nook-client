import { fetchList } from "@nook/app/api/list";
import { ListHeader } from "@nook/app/features/list/list-header";
import { TabNavigation } from "@nook/app/features/tabs";
import { ListType } from "@nook/common/types";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { listId: string } }) {
  const list = await fetchList(params.listId);

  const tabs = [
    {
      id: "casts",
      label: "Casts",
      href: `/lists/${params.listId}`,
    },
  ];

  if (list.type === ListType.USERS) {
    tabs.push({
      id: "transactions",
      label: "Transactions",
      href: `/lists/${params.listId}/transactions`,
    });
  }

  return (
    <>
      <ListHeader list={list} />
      <TabNavigation tabs={tabs}>{children}</TabNavigation>
    </>
  );
}
