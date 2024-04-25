import { getRecommendedChannels } from "@nook/app/api/neynar";
import { PageNavigation } from "../../components/PageNavigation";
import { DefaultSidebar } from "@nook/app/features/home/default-sidebar";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const channels = await getRecommendedChannels();
  return (
    <PageNavigation sidebar={<DefaultSidebar channels={channels} />}>
      {children}
    </PageNavigation>
  );
}
