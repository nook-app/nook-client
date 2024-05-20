import { AnimatePresence, View } from "@nook/app-ui";
import { Transaction } from "@nook/common/types";
import { TransactionDisplay } from "./transaction-display";

export const TransactionLink = ({
  transaction,
}: { transaction: Transaction }) => {
  // @ts-ignore
  const handlePress = (event) => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      window.open(`https://www.onceupon.xyz/${transaction.hash}`, "_blank");
    }
  };

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
        onPress={handlePress}
      >
        <TransactionDisplay transaction={transaction} />
      </View>
    </AnimatePresence>
  );
};
