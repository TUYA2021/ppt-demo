import { fillTemplatePptx } from "@/lib/ppt/fillTemplatePptx";
import type { SlideData } from "@/lib/ppt/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const template = formData.get("template");
  const slidesJson = formData.get("slides");

  if (!(template instanceof File)) {
    return Response.json({ error: "Missing template file" }, { status: 400 });
  }

  if (typeof slidesJson !== "string") {
    return Response.json({ error: "Missing slides JSON" }, { status: 400 });
  }

  const slides = JSON.parse(slidesJson) as SlideData[];
  const buffer = await fillTemplatePptx(await template.arrayBuffer(), slides);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": 'attachment; filename="ai-design-template-output.pptx"',
    },
  });
}
