import { getTemplatePreset } from "@/lib/ppt/templates";
import type { SlideData } from "@/lib/ppt/types";
import { TemplatePreview } from "./TemplatePreview";

export function SlideCanvas({ slide }: { slide: SlideData }) {
  const preset = getTemplatePreset("warmMinimal");

  return (
    <div className="aspect-video w-full overflow-hidden border border-[#d4d4d8] bg-white shadow-sm">
      <TemplatePreview slide={slide} preset={preset} index={0} total={1} />
    </div>
  );
}
