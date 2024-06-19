import { Metadata, ResolvingMetadata } from "next";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { fetchList } from "@nook/app/api/list";
import { ListType } from "@nook/common/types";
import { getURL } from "../../../../utils";

// export async function generateMetadata(
//   { params }: { params: { listId: string } },
//   parent: ResolvingMetadata,
// ): Promise<Metadata | ResolvingMetadata> {
//   const list = await fetchList(params.listId);
//   if (!list) return parent;

//   return {
//     title: list.name,
//     description: list.description,
//     openGraph: {
//       title: list.name,
//       description: list.description,
//       images: [
//         {
//           url: "/banner.png",
//           width: 1200,
//           height: 630,
//           alt: "nook",
//         },
//       ],
//     },
//     manifest: "/manifest.json",
//     other: {
//       "fc:frame": "vNext",
//       // "fc:frame:image": `${getURL()}/api/og/lists/${list.id}`,
//       "fc:frame:image": `https://nook.ngrok.dev/api/og/lists/${list.id}`,
//       "fc:frame:button:1": "View casts",
//       "fc:frame:button:1:action": "link",
//       "fc:frame:button:1:target": `https://nook.social/lists/${list.id}`,
//       "fc:frame:button:2": `List of ${
//         list.type === ListType.USERS ? "users" : "channels"
//       }`,
//       "fc:frame:button:2:action": "link",
//       "fc:frame:button:2:target": `https://nook.social/lists/${list.id}/items`,
//     },
//   };
// }

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { listId: string } }) {
  const list = await fetchList(params.listId);
  return (
    <>
      <NavigationHeader title={list.name} />
      {children}
    </>
  );
}
