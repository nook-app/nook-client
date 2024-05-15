import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "@nook/app/context/auth";
import { UserFilterType } from "@nook/common/types";
import { TransactionFeed } from "@nook/app/features/transactions/transaction-feed";
import {
  DisappearingLayout,
  HEADER_HEIGHT,
} from "../../../../components/DisappearingLayout";
import { useState } from "react";
import { TransactionGroupSelector } from "@nook/app/features/transactions/transaction-group-selector";
import { NookText, View } from "@nook/app-ui";
import { DrawerToggleButton } from "../../../../components/DrawerToggleButton";

export default function TransactionsScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const [contextActions, setContextActions] = useState<string[] | undefined>();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <DisappearingLayout
      title={
        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingVertical="$2"
        >
          <DrawerToggleButton />
          <NookText fontSize="$5" fontWeight="600">
            Transactions
          </NookText>
          <View width="$2.5" />
        </View>
      }
      navigation={<TransactionGroupSelector onPress={setContextActions} />}
    >
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
          contextActions,
        }}
      />
    </DisappearingLayout>
  );
}
