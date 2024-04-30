import { fetchFarconAttendees } from "@nook/app/api/farcon";
import { FarconAttendees } from "@nook/app/features/farcon/attendees";

export default async function Home() {
  const initialData = await fetchFarconAttendees(false);
  return <FarconAttendees following={false} initialData={initialData} />;
}
