import { NavigationHeader } from "../../../components/NavigationHeader";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      <NavigationHeader title="Notifications" />
      {children}
    </>
  );
}
