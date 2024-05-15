import { ScrollView, View } from "@nook/app-ui";
import { Loading } from "@nook/app/components/loading";
import { useAuth } from "@nook/app/context/auth";
import { ListForm } from "@nook/app/features/list/list-form";
import { useList } from "@nook/app/hooks/useList";
import { Redirect, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native";

export default function ListSettingsScreen() {
  const { listId } = useLocalSearchParams();
  const { list } = useList(listId as string);
  const { session } = useAuth();

  if (!list) return <Loading />;

  if (list.creatorId !== session?.id) {
    return <Redirect href="/" />;
  }

  return (
    <View flex={1} backgroundColor="$color1">
      <ScrollView>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ListForm list={list} />
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}
