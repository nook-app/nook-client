import { Input, View } from "@nook/ui";
import { Search } from "@tamagui/lucide-icons";
import { TextInputProps } from "react-native";

export const SearchInput = (props: TextInputProps) => {
  return (
    <View
      backgroundColor="$color3"
      borderRadius="$10"
      flexGrow={1}
      height="$4"
      paddingHorizontal="$3"
    >
      <View flex={1} flexDirection="row" alignItems="center">
        <Search size={16} color="$color11" strokeWidth={3} />
        <Input
          placeholder="Search"
          returnKeyType="search"
          borderWidth="$0"
          backgroundColor="$color3"
          placeholderTextColor="$color11"
          borderRadius="$10"
          flex={1}
          minWidth="$6"
          focusVisibleStyle={{
            outlineWidth: 0,
          }}
          {...props}
        />
      </View>
    </View>
  );
};
