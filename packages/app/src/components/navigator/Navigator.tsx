import { useAuth } from "@/context/auth";
import LoginScreen from "@/screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthNavigator } from "./AuthNavigator";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectNookById } from "@/store/slices/nook";

const Stack = createNativeStackNavigator();

export function Navigator() {
  const { session } = useAuth();
  const nooks = useAppSelector((state) => state.user.nooks);
  const nook = useAppSelector((state) =>
    selectNookById(state, nooks[0]?.nookId),
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && nook ? (
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
