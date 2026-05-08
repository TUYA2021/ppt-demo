import { exportSlidesToPptx } from "@/lib/ppt/exportPptx";
import type { PageSizeId, SlideData, TemplateId } from "@/lib/ppt/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slides: SlideData[];
    templateId?: TemplateId;
    pageSizeId?: PageSizeId;
  };
  const buffer = await exportSlidesToPptx(body.slides, body.templateId, body.pageSizeId);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": 'attachment; filename="ai-design-presentation.pptx"',
    },
  });
}
