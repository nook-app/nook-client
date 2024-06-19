import { View } from "@nook/app-ui";
import { Loading } from "@nook/app/components/loading";
import { useList } from "@nook/app/hooks/useList";
import { useLocalSearchParams } from "expo-router";
import { ItemFeed } from "@nook/app/features/list/item-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function ListItemsScreen() {
  const { listId } = useLocalSearchParams();
  const { list } = useList(listId as string);
  const paddingBottom = useBottomTabBarHeight();

  if (!list) return <Loading />;

  return (
    <View flex={1} backgroundColor="$color1">
      <ItemFeed list={list} paddingBottom={paddingBottom} />
    </View>
  );
}
