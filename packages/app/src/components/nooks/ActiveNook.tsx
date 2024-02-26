import { Text, View, XStack, YStack } from "tamagui";
import { useNooks } from "@/hooks/useNooks";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

export const ActiveNook = () => {
  const { activeNook, activeShelf, navigateToShelf } = useNooks();

  const onPress = useCallback(
    (shelfId: string) => {
      navigateToShelf(shelfId);
    },
    [navigateToShelf],
  );

  if (!activeNook) {
    return null;
  }

  return (
    <YStack minHeight="100%" gap="$2">
      <View
        backgroundColor="$background"
        borderRadius="$6"
        paddingVertical="$3"
        paddingHorizontal="$2.5"
        flexGrow={1}
      >
        <View marginBottom="$3">
          <XStack gap="$2" alignItems="center">
            <YStack>
              <Text fontWeight="700" fontSize="$6">
                {activeNook.name}
              </Text>
            </YStack>
          </XStack>
          {activeNook.description && (
            <View paddingVertical="$1">
              <Text fontSize="$3">{activeNook.description}</Text>
            </View>
          )}
        </View>
        <View gap="$2">
          {activeNook?.shelves.map((shelf, i) => (
            <TouchableOpacity
              key={shelf.slug}
              onPress={() => onPress(shelf.slug)}
            >
              <View
                padding="$2"
                backgroundColor={
                  activeShelf?.slug === shelf.slug || (!activeShelf && i === 0)
                    ? "$backgroundPress"
                    : "$backgroundStrong"
                }
                borderRadius="$4"
              >
                <Text
                  fontWeight={
                    activeShelf?.slug === shelf.slug ||
                    (!activeShelf && i === 0)
                      ? "700"
                      : "500"
                  }
                >
                  {shelf.name}
                </Text>
                <Text color="$gray11" fontSize="$3">
                  {shelf.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </YStack>
  );
};
