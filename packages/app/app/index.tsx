import { Feed } from "../components/feed";

export default function Home() {
  return (
    <Feed
      filter={{
        topics: {
          type: "SOURCE_ENTITY",
          value: "65ba475d191eb695a5defebc",
        },
      }}
    />
  );
}
