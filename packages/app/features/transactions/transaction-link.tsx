import { AnimatePresence, View } from "@nook/app-ui";
import { Transaction } from "@nook/common/types";
import { TransactionDisplay } from "./transaction-display";

export const TransactionLink = ({
  transaction,
}: { transaction: Transaction }) => {
  return (
    <AnimatePresence>
      <View
        enterStyle={{
          opacity: 0,
        }}
        exitStyle={{
          opacity: 0,
        }}
        animation="100ms"
        opacity={1}
        scale={1}
        y={0}
      >
        <TransactionDisplay transaction={transaction} />
      </View>
    </AnimatePresence>
  );
};
