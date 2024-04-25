import { NookText, View } from "@nook/ui";
import { useNotificationsCount } from "../../api/notifications";

export const NotificationsCount = () => {
  const { data } = useNotificationsCount();

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
      <NookText fontWeight="600" fontSize="$1">
        {count > 99 ? "" : count}
      </NookText>
    </View>
  );
};
