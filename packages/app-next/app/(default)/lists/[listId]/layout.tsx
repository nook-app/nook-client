import { NavigationHeader } from "../../../../components/NavigationHeader";
import { fetchList } from "@nook/app/api/list";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { listId: string } }) {
  const list = await fetchList(params.listId);
  return (
    <>
      <NavigationHeader title={list.name} />
      {children}
    </>
  );
}
