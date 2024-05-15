import { NookButton, NookText, ScrollView, View, XStack } from "@nook/app-ui";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListForm } from "@nook/app/features/list/list-form";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "@tamagui/lucide-icons";
import { ListType } from "@nook/common/types";

export default function CreateListModal() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams();

  return (
    <View
      flex={1}
      backgroundColor="$color1"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      <XStack alignItems="center" justifyContent="space-between" padding="$2">
        <NookButton
          size="$3"
          scaleIcon={1.5}
          circular
          icon={X}
          backgroundColor="transparent"
          borderWidth="$0"
          hoverStyle={{
            backgroundColor: "$color4",
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
          }}
          onPress={router.back}
        />
        <NookText fontSize="$5" fontWeight="600">
          Create List
        </NookText>
        <View width="$2.5" />
      </XStack>
      <ScrollView>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ListForm allowedType={type as ListType | undefined} />
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}
