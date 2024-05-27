import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "@nook/app/context/auth";
import { UserFilterType } from "@nook/common/types";
import { TransactionFeed } from "@nook/app/features/transactions/transaction-feed";
import { HEADER_HEIGHT } from "../../../../components/DisappearingLayout";
import { NookText, View } from "@nook/app-ui";
import { DrawerToggleButton } from "../../../../components/DrawerToggleButton";
import { PagerLayout } from "../../../../components/PagerLayout";

export default function TransactionsScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <PagerLayout
      title={
        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingVertical="$2"
        >
          <DrawerToggleButton />
          <NookText fontSize="$5" fontWeight="600">
            Activity
          </NookText>
          <View width="$2.5" />
        </View>
      }
      pages={[
        {
          name: "For You",
          component: (
            <TransactionFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              filter={{
                users: {
                  type: UserFilterType.FOLLOWING,
                  data: {
                    fid: session?.fid,
                  },
                },
                contextActions: ["MINTED", "SWAPPED"],
              }}
            />
          ),
        },
        {
          name: "All",
          component: (
            <TransactionFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              filter={{
                users: {
                  type: UserFilterType.FOLLOWING,
                  data: {
                    fid: session?.fid,
                  },
                },
                contextActions: ["-RECEIVED_AIRDROP"],
              }}
            />
          ),
        },
      ]}
    />
  );
}
