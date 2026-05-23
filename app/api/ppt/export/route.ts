import { exportSlidesToPptx } from "@/lib/ppt/exportPptx";
import { buildSlidesFromProjectPayload } from "@/lib/ppt/buildSlides";
import type { PageSizeId, ProjectPptPayload, SlideData, TemplateId } from "@/lib/ppt/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    payload?: ProjectPptPayload;
    slides?: SlideData[];
    templateId?: TemplateId;
    pageSizeId?: PageSizeId;
  };
  const slides = body.payload ? buildSlidesFromProjectPayload(body.payload) : (body.slides ?? []);
  const buffer = await exportSlidesToPptx(slides, body.templateId, body.pageSizeId);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": 'attachment; filename="ai-design-presentation.pptx"',
    },
  });
}
