import { PageNavigation } from "../../components/PageNavigation";
import { DefaultSidebar } from "@nook/app/features/home/default-sidebar";

export default async function Default({
  children,
}: { children: React.ReactNode }) {
  return (
    <PageNavigation sidebar={<DefaultSidebar />}>{children}</PageNavigation>
  );
}
