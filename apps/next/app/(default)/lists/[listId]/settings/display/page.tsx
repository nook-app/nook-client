import { fetchList } from "@nook/app/api/list";
import { ListDisplayPicker } from "@nook/app/features/list/list-display-picker";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);

  return <ListDisplayPicker list={list} />;
}
