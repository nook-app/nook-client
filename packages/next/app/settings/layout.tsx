import { getServerSession } from "@nook/app/server/auth";
import { PageNavigation } from "../../components/PageNavigation";
import { notFound } from "next/navigation";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) return notFound();
  return <PageNavigation>{children}</PageNavigation>;
}
