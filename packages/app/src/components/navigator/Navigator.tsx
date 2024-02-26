import { useAuth } from "@/context/auth";
import LoginScreen from "@/screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Theme } from "tamagui";
import { Modals } from "@/modals/Modals";
import { selectNookById } from "@/store/slices/nook";

const Stack = createNativeStackNavigator();

export function Navigator() {
  const { session } = useAuth();
  const homeNook = useAppSelector((state) => selectNookById(state, "home"));
  const theme = useAppSelector((state) => state.user.theme);

  return (
    <Theme name={theme || "gray"}>
      <Modals />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && homeNook ? (
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </Theme>
  );
}
