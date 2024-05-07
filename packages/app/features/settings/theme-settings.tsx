import { NookText, ThemeName, View, XStack, YStack } from "@nook/app-ui";
import { useTheme } from "../../context/theme";

export const ThemeSettings = () => {
  const { theme: myTheme, setTheme } = useTheme();

  const themes: ThemeName[] = [
    "mauve",
    "blue",
    "green",
    "orange",
    "pink",
    "purple",
    "red",
    "yellow",
  ];

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Theme</NookText>
        <NookText muted>
          Change the theme for your account. You can select a different theme
          for each of your accounts.
        </NookText>
      </YStack>
      <XStack justifyContent="space-around">
        <View
          backgroundColor="black"
          width="$4"
          height="$4"
          borderRadius="$10"
          borderWidth="$1"
          borderColor={myTheme === "dark" ? "$mauve12" : "$mauve7"}
          onPress={() => setTheme("dark")}
        />
        {themes.slice(0, 4).map((t, i) => (
          <ThemeItem
            key={t}
            theme={t}
            isActive={myTheme === t}
            onPress={setTheme}
          />
        ))}
      </XStack>
      <XStack justifyContent="space-around">
        <View
          backgroundColor="white"
          width="$4"
          height="$4"
          borderRadius="$10"
          borderWidth="$1"
          borderColor={myTheme === "light" ? "$mauve12" : "$mauve7"}
          onPress={() => setTheme("light")}
        />
        {themes.slice(4).map((t, i) => (
          <ThemeItem
            key={t}
            theme={t}
            isActive={myTheme === t}
            onPress={setTheme}
          />
        ))}
      </XStack>
    </YStack>
  );
};

const ThemeItem = ({
  theme,
  isActive,
  onPress,
}: {
  theme: ThemeName;
  isActive: boolean;
  onPress: (theme: ThemeName) => void;
}) => (
  <View
    theme={theme}
    backgroundColor={isActive ? "$color9" : "$color5"}
    width="$4"
    height="4"
    borderRadius="$10"
    borderWidth="$1"
    borderColor={isActive ? "$color12" : "$color7"}
    onPress={() => onPress(theme)}
  />
);
