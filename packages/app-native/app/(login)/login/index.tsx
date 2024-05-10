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
import { Href } from "expo-router/build/link/href";
import { LinearGradient } from "@tamagui/linear-gradient";
import { useTheme } from "@nook/app/context/theme";

export default function LoginScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <LinearGradient
      flex={1}
      alignItems="center"
      paddingBottom={insets.bottom}
      paddingHorizontal="$4"
      colors={["$color7", "$color1", "$color1"]}
      start={[0, 1]}
      end={[0, 0]}
    >
      <View flexGrow={1} justifyContent="center">
        <YStack alignItems="center">
          <Text fontWeight="600" fontSize="$15" color="$color12">
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
          icon={<Wallet2 strokeWidth={2.5} color="black" />}
          label="Sign in with Wallet"
        />
        <LoginButton
          icon={<Lock strokeWidth={2.5} color="black" />}
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
      backgroundColor="white"
      borderWidth="$0"
      color="black"
      pressStyle={{
        backgroundColor: "white",
        opacity: 0.9,
      }}
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
    <XStack justifyContent="space-around" marginTop="$4" width="100%">
      {themes.map((t, i) => (
        <ThemeItem key={t || i} theme={t} onPress={setTheme} />
      ))}
    </XStack>
  );
};

const ThemeItem = ({
  theme,
  onPress,
}: {
  theme: ThemeName | undefined;
  onPress: (theme: ThemeName | undefined) => void;
}) => (
  <View
    theme={theme}
    backgroundColor={theme ? "$color9" : "$color1"}
    width="$2"
    height="$2"
    borderRadius="$10"
    borderWidth="$1"
    borderColor={theme ? "$color10" : "$mauve7"}
    onPress={() => onPress(theme)}
  />
);
