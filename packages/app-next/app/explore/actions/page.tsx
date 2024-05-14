// TODO: Move this to backend with our own explore routes

import { ExploreActions } from "@nook/app/features/explore/explore-actions";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { getFarcasterActions } from "@nook/app/api/warpcast";

export default async function Explore() {
  const actions = await getFarcasterActions();
  return (
    <>
      <NavigationHeader title="Explore Actions" />
      <ExploreActions initialData={actions} />
    </>
  );
}
