import { PageNavigation } from "../../components/PageNavigation";
import { HomeTabs } from "@nook/app/features/home/home-tabs";
import { HomeSidebar } from "@nook/app/features/home/home-sidebar";

export default async function Home() {
  return (
    <PageNavigation sidebar={<HomeSidebar />}>
      <HomeTabs activeIndex={2} />
    </PageNavigation>
  );
}
