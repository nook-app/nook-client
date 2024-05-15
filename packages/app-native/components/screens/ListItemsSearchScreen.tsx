import { NookText, View } from "@nook/app-ui";
import { Loading } from "@nook/app/components/loading";
import { useAuth } from "@nook/app/context/auth";
import { useList } from "@nook/app/hooks/useList";
import { Redirect, useLocalSearchParams } from "expo-router";
import { ListType } from "@nook/common/types";
import { ListUserSearch } from "@nook/app/features/list/user-search";
import { ListChannelSearch } from "@nook/app/features/list/channel-search";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { PagerLayout } from "../PagerLayout";
import { BackButton } from "../IconButton";
import { HEADER_HEIGHT } from "../DisappearingLayout";
import { ItemFeed } from "@nook/app/features/list/item-feed";

export default function ListItemsSearchScreen() {
  const { listId } = useLocalSearchParams();
  const { list } = useList(listId as string);
  const { session } = useAuth();
  const paddingBottom = useBottomTabBarHeight();

  if (!list) return <Loading />;

  if (list.creatorId !== session?.id) {
    return <Redirect href="/" />;
  }

  return (
    <PagerLayout
      title={
        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingVertical="$2"
        >
          <BackButton />
          <NookText fontSize="$5" fontWeight="600">
            {`Edit ${list.type === ListType.USERS ? "Users" : "Channels"}`}
          </NookText>
          <View width="$2.5" />
        </View>
      }
      pages={[
        list.type === ListType.USERS
          ? {
              name: "Search",
              component: (
                <ListUserSearch
                  listId={list.id}
                  paddingTop={HEADER_HEIGHT}
                  paddingBottom={paddingBottom}
                />
              ),
            }
          : {
              name: "Search",
              component: (
                <ListChannelSearch
                  listId={list.id}
                  paddingTop={HEADER_HEIGHT}
                  paddingBottom={paddingBottom}
                />
              ),
            },
        {
          name: list.type === ListType.USERS ? "Users" : "Channels",
          component: (
            <ItemFeed
              listId={list.id}
              paddingTop={HEADER_HEIGHT}
              paddingBottom={paddingBottom}
            />
          ),
        },
      ]}
    />
  );
}
