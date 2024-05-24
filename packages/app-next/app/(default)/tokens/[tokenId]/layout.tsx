import { NavigationHeader } from "../../../../components/NavigationHeader";
import { fetchToken } from "@nook/app/api/token";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { tokenId: string } }) {
  const nft = await fetchToken(params.tokenId);
  return (
    <>
      <NavigationHeader title={nft.name || "Token"} />
      {children}
    </>
  );
}
