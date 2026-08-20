import Funnel from "@/components/Funnel";
import { getSettings, toPublic } from "@/lib/settings";

export default async function Home() {
  const settings = await getSettings();
  return <Funnel settings={toPublic(settings)} />;
}
