import { ModePage } from "@/components/home/ModePage";
import { modePageMetadata } from "@/lib/site";

export const metadata = modePageMetadata("parca");

export default function ParcaPage() {
  return <ModePage mode="parca" />;
}
