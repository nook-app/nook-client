import { NookText, ThemeName, View, XStack, YStack } from "@nook/ui";
import { useTheme } from "../../context/theme";

export const ThemeSettings = () => {
  const { theme: myTheme, setTheme, colorSchemeOverride } = useTheme();

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

  const defaultTheme =
    colorSchemeOverride === "light" ? "light" : ("dark" as ThemeName);

  return (
    <YStack>
      <NookText variant="label">Select Theme</NookText>
      <XStack justifyContent="space-around">
        <View
          theme={defaultTheme}
          backgroundColor="$color1"
          width="$2.5"
          height="$2.5"
          borderRadius="$10"
          borderWidth="$1"
          borderColor={myTheme === defaultTheme ? "$color11" : "$color7"}
          onPress={() => setTheme(defaultTheme)}
        />
        {themes.slice(0, 4).map((t, i) => (
          <View
            key={t}
            theme={t}
            backgroundColor={"$color5"}
            width="$2.5"
            height="$2.5"
            borderRadius="$10"
            borderWidth="$1"
            borderColor={myTheme === t ? "$color11" : "$color7"}
            onPress={() => setTheme(t)}
          />
        ))}
      </XStack>
      <XStack justifyContent="space-around">
        {themes.slice(4).map((t, i) => (
          <View
            key={t}
            theme={t}
            backgroundColor={"$color5"}
            width="$2.5"
            height="$2.5"
            borderRadius="$10"
            borderWidth="$1"
            borderColor={myTheme === t ? "$color11" : "$color7"}
            onPress={() => setTheme(t)}
          />
        ))}
      </XStack>
    </YStack>
  );
};
