import { ModePage } from "@/components/home/ModePage";
import { modePageMetadata } from "@/lib/site";

export const metadata = modePageMetadata("rua");

export default function RuaPage() {
  return <ModePage mode="rua" />;
}
