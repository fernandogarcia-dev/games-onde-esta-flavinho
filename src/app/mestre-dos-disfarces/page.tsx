import { ModePage } from "@/components/home/ModePage";
import { modePageMetadata } from "@/lib/site";

export const metadata = modePageMetadata("mestre");

export default function MestrePage() {
  return <ModePage mode="mestre" />;
}
