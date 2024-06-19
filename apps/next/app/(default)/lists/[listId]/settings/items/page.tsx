import { fetchList } from "@nook/app/api/list";
import { ListType } from "@nook/common/types";
import { ListUserSearch } from "@nook/app/features/list/user-search";
import { ListChannelSearch } from "@nook/app/features/list/channel-search";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);

  if (list.type === ListType.USERS) {
    return <ListUserSearch list={list} />;
  }

  return <ListChannelSearch list={list} />;
}
