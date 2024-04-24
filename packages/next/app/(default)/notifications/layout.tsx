import { NavigationHeader } from "../../../components/NavigationHeader";
import { DefaultSidebar } from "@nook/app/features/home/default-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";

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
