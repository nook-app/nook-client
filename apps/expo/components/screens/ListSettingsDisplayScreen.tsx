import { View } from "@nook/app-ui";
import { Loading } from "@nook/app/components/loading";
import { useAuth } from "@nook/app/context/auth";
import { useList } from "@nook/app/hooks/useList";
import { Redirect, useLocalSearchParams } from "expo-router";
import { ListDisplayPicker } from "@nook/app/features/list/list-display-picker";

export default function ListSettingsDisplayScreen() {
  const { listId } = useLocalSearchParams();
  const { list } = useList(listId as string);
  const { session } = useAuth();

  if (!list) return <Loading />;

  if (list.creatorId !== session?.id) {
    return <Redirect href="/" />;
  }

  return (
    <View flex={1} backgroundColor="$color1">
      <ListDisplayPicker list={list} />
    </View>
  );
}
