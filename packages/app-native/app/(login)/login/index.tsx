import { useAuth } from "@nook/app/context/auth";
import {
  Button,
  Image,
  Text,
  ThemeName,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { Link, Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";
import { Wallet2, Lock } from "@tamagui/lucide-icons";
import { useTheme } from "@nook/app/context/theme";
import { Href } from "expo-router/build/link/href";
import { LinearGradient } from "@tamagui/linear-gradient";

export default function LoginScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <LinearGradient
      flex={1}
      alignItems="center"
      paddingBottom={insets.bottom}
      paddingHorizontal="$4"
      theme={theme}
      themeShallow
      colors={["$color7", "$color1", "$color1", "$color1"]}
      start={[0, 0]}
      end={[0, 1]}
    >
      <View flexGrow={1} justifyContent="center">
        <YStack alignItems="center">
          <Text fontWeight="700" fontSize="$15" color="$color12">
            nook
          </Text>
          <Text textAlign="center" fontSize="$5">
            A new way to navigate and experience crypto, onchain and offchain.
          </Text>
          <ThemeSelector />
        </YStack>
      </View>
      <YStack gap="$3" alignItems="center" width="100%">
        <LoginButton
          icon={
            <Image
              source={require("../../../assets/farcaster.webp")}
              width="100%"
              height="100%"
            />
          }
          label="Sign in with Farcaster"
        />
        <LoginButton
          icon={<Wallet2 strokeWidth={2.5} color="$color1" />}
          label="Sign in with Wallet"
        />
        <LoginButton
          icon={<Lock strokeWidth={2.5} color="$color1" />}
          label="Sign in with Password"
          href={{
            pathname: "/(login)/login/dev",
          }}
        />
      </YStack>
    </LinearGradient>
  );
}

const LoginButton = ({
  icon,
  label,
  href,
}: { icon: ReactNode; label: string; href?: Href }) => {
  const Component = (
    <Button
      height="$5"
      width="100%"
      borderRadius="$10"
      fontWeight="600"
      fontSize="$5"
      backgroundColor="$color12"
      color="$color1"
    >
      <View
        position="absolute"
        left="$4"
        width="$2"
        height="$2"
        justifyContent="center"
        alignItems="center"
      >
        {icon}
      </View>
      {label}
    </Button>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {Component}
      </Link>
    );
  }

  return Component;
};

const ThemeSelector = () => {
  const { setTheme } = useTheme();

  const themes: ThemeName[] = [
    "pink",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "mauve",
  ];

  return (
    <XStack justifyContent="space-around" marginTop="$4" width="100%">
      {themes.map((t, i) => (
        <ThemeItem key={t} theme={t} onPress={setTheme} />
      ))}
    </XStack>
  );
};

const ThemeItem = ({
  theme,
  onPress,
}: {
  theme: ThemeName;
  onPress: (theme: ThemeName) => void;
}) => (
  <View
    theme={theme}
    backgroundColor={"$color9"}
    width="$2"
    height="$2"
    borderRadius="$10"
    borderWidth="$1"
    borderColor={"$color11"}
    onPress={() => onPress(theme)}
  />
);
