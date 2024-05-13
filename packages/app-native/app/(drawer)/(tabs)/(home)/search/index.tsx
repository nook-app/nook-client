import { useLocalSearchParams } from "expo-router";
import SearchScreen from "../../../../../components/screens/SearchScreen";
import SearchResultsScreen from "../../../../../components/screens/SearchResultsScreen";

export default function Screen() {
  const { q } = useLocalSearchParams();

  if (q) {
    return <SearchResultsScreen />;
  }

  return <SearchScreen />;
}
