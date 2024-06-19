import { TamaguiElement, View } from "@nook/app-ui";
import { Plus, MenuSquare } from "@tamagui/lucide-icons";
import { Link } from "@nook/app/components/link";
import { useLocalSearchParams } from "expo-router";
import { useScroll } from "@nook/app/context/scroll";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ComponentType, ReactNode, forwardRef, useEffect } from "react";
import { useAuth } from "@nook/app/context/auth";
import { useTheme } from "@nook/app/context/theme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export const CreateActionButton = () => {
  const { channelId } = useLocalSearchParams();
  const { signer } = useAuth();

  return (
    <ActionButton>
      <Link
        href={
          signer?.state === "completed"
            ? {
                pathname: "/create/cast",
                params: { text: "", channelId },
              }
            : {
                pathname: "/enable-signer",
              }
        }
        unpressable
        absolute
      >
        <Button Icon={Plus} />
      </Link>
    </ActionButton>
  );
};

export const CreateListButton = () => {
  return (
    <ActionButton>
      <Link
        href={{
          pathname: "/create/list",
        }}
        unpressable
        absolute
      >
        <Button Icon={MenuSquare} />
      </Link>
    </ActionButton>
  );
};

const Button = forwardRef<
  TamaguiElement,
  {
    Icon: ComponentType<{ color: string }>;
    onPress?: () => void;
    onLongPress?: () => void;
  }
>(({ Icon, onPress, onLongPress }, ref) => {
  const { theme } = useTheme();
  return (
    <View
      width="$5"
      height="$5"
      position="absolute"
      bottom="$3"
      right="$3"
      backgroundColor={!theme ? "$color12" : "$color9"}
      justifyContent="center"
      alignItems="center"
      borderRadius="$10"
      shadowRadius={5}
      shadowOffset={{ width: 0, height: 0 }}
      shadowColor="$shadowColor"
      pressStyle={{
        scale: 0.75,
      }}
      animation="100ms"
      onPress={onPress}
      onLongPress={onLongPress}
      ref={ref}
    >
      <Icon color={!theme ? "$color1" : "white"} />
    </View>
  );
});

export const ActionButton = ({ children }: { children: ReactNode }) => {
  const { isScrolling } = useScroll();
  const bottom = useBottomTabBarHeight();

  //   const animation = useSharedValue(0);
  //   const [open, setOpen] = useState(false);

  //   const toggleMenu = () => {
  //     animation.value = withSpring(open ? 0 : 1, {
  //       damping: 5,
  //       stiffness: 100,
  //       mass: 1,
  //     });
  //     setOpen(!open);
  //   };

  //   const rotation = useAnimatedStyle(() => {
  //     return {
  //       transform: [
  //         {
  //           rotate: `${interpolate(
  //             animation.value,
  //             [0, 1],
  //             [0, 360],
  //             Extrapolate.CLAMP,
  //           )}deg`,
  //         },
  //       ],
  //     };
  //   });

  //   const animatedStyles = [...Array(3)].map((_, index) => {
  //     const angle = index * (120 / 2) + 75;
  //     const radius = 90;
  //     return useAnimatedStyle(() => {
  //       const translateY =
  //         -radius * Math.sin((angle * Math.PI) / 180) * animation.value;
  //       const translateX =
  //         radius * Math.cos((angle * Math.PI) / 180) * animation.value;
  //       return {
  //         transform: [{ scale: animation.value }, { translateX }, { translateY }],
  //       };
  //     });
  //   });

  const opacity = useSharedValue(isScrolling ? 0.5 : 1);

  useEffect(() => {
    opacity.value = withTiming(isScrolling ? 0.5 : 1, { duration: 100 });
  }, [isScrolling, opacity]);

  const opacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View position="absolute" right={0} bottom={bottom}>
      <Animated.View style={[opacityStyle]}>
        {/* {open &&
        animatedStyles.map((style, index) => (
          <TouchableOpacity key={index}>
            <Animated.View style={[style]}>
              <Button>
                {index === 0 ? (
                  <Entypo name="attachment" size={24} color="#FFF" />
                ) : index === 1 ? (
                  <FontAwesome name="camera" size={20} color="#FFF" />
                ) : (
                  <MaterialCommunityIcons
                    name="microphone"
                    size={20}
                    color="#FFF"
                  />
                )}
              </Button>
            </Animated.View>
          </TouchableOpacity>
        ))} */}
        {children}
      </Animated.View>
    </View>
  );
};
