import { NookText, View } from "@nook/app-ui";
import { useNotificationsCount } from "../../api/notifications";
import { useAuth } from "../../context/auth";

export const NotificationsCount = () => {
  const { session } = useAuth();
  const { data } = useNotificationsCount(session?.fid);

  const count = data?.count || 0;

  if (count === 0) return null;

  return (
    <View
      borderRadius="$10"
      backgroundColor="$red9"
      alignItems="center"
      justifyContent="center"
      minHeight="$0.9"
      minWidth="$0.9"
      paddingHorizontal="$1.5"
    >
      <NookText fontWeight="600" fontSize="$1" color="white">
        {count > 99 ? "" : count}
      </NookText>
    </View>
  );
};
