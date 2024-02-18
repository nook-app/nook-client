import { useAuth } from "@/context/auth";
import LoginScreen from "@/screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const Stack = createNativeStackNavigator();

export function Navigator() {
  const { session } = useAuth();
  const activeNook = useAppSelector((state) => state.user.activeNook);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && activeNook ? (
        <>
          <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
