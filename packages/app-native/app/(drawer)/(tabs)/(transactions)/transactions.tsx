import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuth } from "@nook/app/context/auth";
import { UserFilterType } from "@nook/common/types";
import { TransactionFeed } from "@nook/app/features/transactions/transaction-feed";
import {
  DisappearingLayout,
  HEADER_HEIGHT,
} from "../../../../components/DisappearingLayout";
import { useCallback, useState } from "react";
import { TransactionChainSelector } from "@nook/app/features/transactions/transaction-chain-selector";

export default function TransactionsScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const [chains, setChains] = useState<number[]>([]);
  const { session } = useAuth();

  const toggleChain = useCallback((chain: number) => {
    setChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  }, []);

  if (!session?.fid) return null;

  return (
    <DisappearingLayout
      title="Transactions"
      navigation={
        <TransactionChainSelector chains={chains} onPress={toggleChain} />
      }
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
          chains,
        }}
      />
    </DisappearingLayout>
  );
}
