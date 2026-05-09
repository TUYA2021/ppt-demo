import path from "node:path";
import pptxgen from "pptxgenjs";
import { getSlideLayoutPreset, type ImageLayoutBox, type TextLayoutBox } from "./layoutPresets";
import { getPageSizePreset, getTemplatePreset } from "./templates";
import type { PageSizeId, SlideData, TemplateId, TemplatePreset } from "./types";

function hex(color: string) {
  return color.replace("#", "");
}

function publicImagePath(slide: SlideData) {
  const imagePath = slide.image ?? slide.images?.[0];

  if (!imagePath?.startsWith("/")) {
    return undefined;
  }

  return path.join(process.cwd(), "public", imagePath);
}

function addFooter(
  slide: pptxgen.Slide,
  index: number,
  total: number,
  preset: TemplatePreset,
  pageSizeId: PageSizeId,
) {
  if (!preset.showPageNumber) {
    return;
  }

  const pageSize = getPageSizePreset(pageSizeId);

  slide.addText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: pageSize.width - 1.4,
    y: pageSize.height - 0.55,
    w: 0.9,
    h: 0.18,
    fontFace: preset.font.body,
    fontSize: 8,
    color: hex(preset.colors.muted),
    align: "right",
    margin: 0,
  });
}

function addTextBox(
  slide: pptxgen.Slide,
  text: string,
  box: TextLayoutBox,
  preset: TemplatePreset,
  color: string,
  bold = true,
) {
  slide.addText(text, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontFace: bold ? preset.font.title : preset.font.body,
    fontSize: box.fontSize,
    bold,
    color: hex(color),
    margin: 0,
    fit: "shrink",
  });
}

function addImageBox(
  slide: pptxgen.Slide,
  item: SlideData,
  box: ImageLayoutBox,
  preset: TemplatePreset,
) {
  const imagePath = publicImagePath(item);

  slide.addShape("rect", {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fill: { color: hex(preset.colors.imageBg) },
    line: { color: hex(preset.colors.imageBg) },
  });

  if (!imagePath) {
    return;
  }

  slide.addImage({
    path: imagePath,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    sizing: { type: box.fit, x: box.x, y: box.y, w: box.w, h: box.h },
  });
}

function addSlideContent(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  pageSizeId: PageSizeId,
) {
  const layout = getSlideLayoutPreset(pageSizeId, item.layout);

  if (layout.image) {
    addImageBox(slide, item, layout.image, preset);
  }

  addTextBox(slide, item.title, layout.title, preset, preset.colors.text);

  if (item.layout === "cover" && item.subtitle && layout.subtitle) {
    addTextBox(slide, item.subtitle, layout.subtitle, preset, preset.colors.muted, false);
  }
}

export async function exportSlidesToPptx(
  slides: SlideData[],
  templateId: TemplateId = "warmMinimal",
  pageSizeId: PageSizeId = "wide16x9",
): Promise<ArrayBuffer> {
  const preset = getTemplatePreset(templateId);
  const pageSize = getPageSizePreset(pageSizeId);
  const pptx = new pptxgen();

  pptx.defineLayout({ name: pageSize.id, width: pageSize.width, height: pageSize.height });
  pptx.layout = pageSize.id;
  pptx.author = "Interior Presentation Builder";
  pptx.subject = "室内方案汇报 PPT";
  pptx.title = slides[0]?.title ?? "Interior Presentation";
  pptx.company = "ppt-demo";
  pptx.theme = {
    headFontFace: preset.font.title,
    bodyFontFace: preset.font.body,
  };

  slides.forEach((item, index) => {
    const slide = pptx.addSlide();

    slide.background = { color: hex(preset.colors.background) };
    addSlideContent(slide, item, preset, pageSizeId);
    addFooter(slide, index, slides.length, preset, pageSizeId);
  });

  const data = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const arrayBuffer = new ArrayBuffer(data.byteLength);

  new Uint8Array(arrayBuffer).set(data);

  return arrayBuffer;
}
