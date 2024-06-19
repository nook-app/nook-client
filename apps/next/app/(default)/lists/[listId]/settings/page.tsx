import { fetchList } from "@nook/app/api/list";
import { ListForm } from "@nook/app/features/list/list-form";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);
  return <ListForm list={list} />;
}
