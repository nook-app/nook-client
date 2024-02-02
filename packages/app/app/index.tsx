import { View } from "tamagui";
import { Feed } from "../components/feed";

export default function Home() {
  return (
    <View height="100%" backgroundColor="$background" theme="pink">
      <Feed
        // filter={{
        //   topics: {
        //     type: "SOURCE_ENTITY",
        //     value: "65ba475d191eb695a5defebc",
        //   },
        //   type: "POST",
        //   deletedAt: null,
        // }}
        filter={{
          topics: {
            $elemMatch: {
              type: "SOURCE_EMBED",
              value: {
                $regex: "farcaster.manifold.xyz",
              },
            },
          },
          type: "POST",
          deletedAt: null,
        }}
      />
    </View>
  );
}
