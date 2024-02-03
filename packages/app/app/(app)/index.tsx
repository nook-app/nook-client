import { Button, View } from "tamagui";
import { Feed } from "../../components/feed";
import { useAuth } from "../../context/auth";

export default function FeedScreen() {
  const { signOut } = useAuth();
  return (
    <View backgroundColor="$background" theme="orange">
      <View>
        <Button
          onPress={() => {
            signOut();
          }}
        >
          Sign Out
        </Button>
      </View>
      <Feed
        filter={{
          topics: {
            type: "SOURCE_ENTITY",
            value: "65ba4763191eb695a5defeda",
          },
          type: "POST",
          deletedAt: null,
        }}
        // filter={{
        //   topics: {
        //     $elemMatch: {
        //       type: "SOURCE_EMBED",
        //       value: {
        //         $regex: "farcaster.manifold.xyz",
        //       },
        //     },
        //   },
        //   type: "POST",
        //   deletedAt: null,
        // }}
      />
    </View>
  );
}
