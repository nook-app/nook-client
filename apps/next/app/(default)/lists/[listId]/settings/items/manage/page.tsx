import { fetchList } from "@nook/app/api/list";
import { ItemFeed } from "@nook/app/features/list/item-feed";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);

  return <ItemFeed list={list} />;
}
