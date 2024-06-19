import { useAuth } from "@nook/app/context/auth";
import { ListType } from "@nook/common/types";
import { NookText, View } from "@nook/app-ui";
import { ListFeed } from "@nook/app/features/list/list-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { PagerLayout } from "../PagerLayout";
import { BackButton } from "../IconButton";
import { HEADER_HEIGHT } from "../DisappearingLayout";
import { CreateListButton } from "../ActionButton";

export default function ListsScreen() {
  const { session } = useAuth();
  const paddingBottom = useBottomTabBarHeight();

  if (!session?.fid) return null;

  return (
    <>
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
              Lists
            </NookText>
            <View width="$2.5" />
          </View>
        }
        pages={[
          {
            name: "Users",
            component: (
              <ListFeed
                filter={{ type: ListType.USERS, userId: session.id }}
                paddingTop={HEADER_HEIGHT}
                paddingBottom={paddingBottom}
              />
            ),
          },
          {
            name: "Channels",
            component: (
              <ListFeed
                filter={{ type: ListType.PARENT_URLS, userId: session.id }}
                paddingTop={HEADER_HEIGHT}
                paddingBottom={paddingBottom}
              />
            ),
          },
        ]}
      />
      <CreateListButton />
    </>
  );
}
