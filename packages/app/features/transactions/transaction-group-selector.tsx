import { Text, XStack } from "@nook/app-ui";
import { useState } from "react";

const options = [
  {
    label: "Collectibles",
    contextActions: ["MINTED", "BOUGHT"],
  },
  {
    label: "Tokens",
    contextActions: ["SWAPPED"],
  },
  {
    label: "All",
    contextActions: ["-RECEIVED_AIRDROP"],
  },
];

export const TransactionGroupSelector = ({
  onPress,
}: { onPress: (contextActions?: string[]) => void }) => {
  const [selectedOption, setSelectedOption] = useState(0);

  return (
    <XStack justifyContent="space-around" padding="$2">
      {options.map((option, index) => (
        <XStack
          key={option.label}
          gap="$1.5"
          borderRadius="$6"
          paddingVertical="$1.5"
          paddingHorizontal="$2.5"
          borderColor={selectedOption === index ? "$color11" : "$borderColorBg"}
          borderWidth="$0.5"
          cursor="pointer"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color4",
          }}
          backgroundColor={selectedOption === index ? "$color5" : undefined}
          onPress={() => {
            setSelectedOption(index);
            onPress(option.contextActions);
          }}
        >
          <Text
            fontSize="$3"
            fontWeight="600"
            color={selectedOption === index ? "$color12" : "$mauve10"}
          >
            {option.label}
          </Text>
        </XStack>
      ))}
    </XStack>
  );
};
