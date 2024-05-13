import { NookText, ThemeName, View, XStack, YStack } from "@nook/app-ui";
import { useTheme } from "../../context/theme";

export const ThemeSettings = () => {
  const { theme: myTheme, setTheme } = useTheme();

  const themes: (ThemeName | undefined)[] = [
    "pink",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "mauve",
    undefined,
  ];

  return (
    <YStack gap="$4" padding="$2.5">
      <NookText muted>
        Change the theme for your account. You can select a different theme for
        each of your accounts.
      </NookText>
      <XStack justifyContent="space-around">
        {themes.slice(0, 5).map((t, i) => (
          <ThemeItem
            key={t || i}
            theme={t}
            isActive={myTheme === t}
            onPress={setTheme}
          />
        ))}
      </XStack>
      <XStack justifyContent="space-around">
        {themes.slice(5).map((t, i) => (
          <ThemeItem
            key={t || i}
            theme={t}
            isActive={myTheme === t}
            onPress={setTheme}
          />
        ))}
        <View width="$5" />
      </XStack>
    </YStack>
  );
};

const ThemeItem = ({
  theme,
  isActive,
  onPress,
}: {
  theme: ThemeName | undefined;
  isActive: boolean;
  onPress: (theme: ThemeName | undefined) => void;
}) => (
  <View
    theme={theme}
    backgroundColor={
      isActive && theme ? "$color10" : theme ? "$color6" : "$mauve1"
    }
    width="$5"
    height="$5"
    borderRadius="$10"
    borderWidth="$1"
    borderColor={isActive ? "$color12" : theme ? "$color8" : "$mauve7"}
    onPress={() => onPress(theme)}
  />
);
