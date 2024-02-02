import { View } from "tamagui";
import { Feed } from "../components/feed";

export default function Home() {
  return (
    <View height="100%" backgroundColor="$background" theme="orange">
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
