import path from "node:path";
import pptxgen from "pptxgenjs";
import { getSlideLayoutPreset, type ImageLayoutBox, type TextLayoutBox } from "./layoutPresets";
import { getSlidesForPageSize } from "./slidesForPageSize";
import { getPageSizePreset, getTemplatePreset } from "./templates";
import type { PageSizeId, SlideData, TemplateId, TemplatePreset } from "./types";

function hex(color: string) {
  return color.replace("#", "");
}

function publicImagePath(imagePath?: string) {

  if (!imagePath?.startsWith("/")) {
    return undefined;
  }

  return path.join(process.cwd(), "public", imagePath);
}

async function imageData(image?: string) {
  if (!image) {
    return undefined;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    const response = await fetch(image);

    if (!response.ok) {
      return undefined;
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      data: `data:${contentType};base64,${buffer.toString("base64")}`,
    };
  }

  const imagePath = publicImagePath(image);

  return imagePath ? { path: imagePath } : undefined;
}

function slideImages(slide: SlideData) {
  const images = slide.images ?? [];

  return slide.image ? [slide.image, ...images.filter((image) => image !== slide.image)] : images;
}

function imageBoxes(
  layout: ReturnType<typeof getSlideLayoutPreset>,
  imageCount: number,
) {
  if (imageCount === 1 && layout.singleImage) {
    return [layout.singleImage];
  }

  return layout.imageSlots ?? (layout.image ? [layout.image] : []);
}

function visibleImageBoxes(
  layout: ReturnType<typeof getSlideLayoutPreset>,
  imageCount: number,
) {
  const boxes = imageBoxes(layout, imageCount);

  if (imageCount === 0) {
    return [];
  }

  return boxes.slice(0, imageCount);
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
    align: box.align ?? "left",
    margin: 0,
    fit: "shrink",
  });
}

async function addImageBox(
  slide: pptxgen.Slide,
  image: string | undefined,
  box: ImageLayoutBox,
) {
  const source = await imageData(image);

  if (!source) {
    return;
  }

  slide.addImage({
    ...source,
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    sizing: { type: box.fit, x: box.x, y: box.y, w: box.w, h: box.h },
  });
}

async function addSlideContent(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  pageSizeId: PageSizeId,
) {
  const layout = getSlideLayoutPreset(pageSizeId, item.layout);
  const images = slideImages(item);
  const imageSlots = visibleImageBoxes(layout, images.length);

  await Promise.all(
    imageSlots.map((box, imageIndex) => addImageBox(slide, images[imageIndex], box)),
  );

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
  const exportSlides = getSlidesForPageSize(slides, pageSizeId);
  const pptx = new pptxgen();

  pptx.defineLayout({ name: pageSize.id, width: pageSize.width, height: pageSize.height });
  pptx.layout = pageSize.id;
  pptx.author = "Interior Presentation Builder";
  pptx.subject = "室内方案汇报 PPT";
  pptx.title = exportSlides[0]?.title ?? "Interior Presentation";
  pptx.company = "ppt-demo";
  pptx.theme = {
    headFontFace: preset.font.title,
    bodyFontFace: preset.font.body,
  };

  for (const [index, item] of exportSlides.entries()) {
    const slide = pptx.addSlide();

    slide.background = { color: hex(preset.colors.background) };
    await addSlideContent(slide, item, preset, pageSizeId);
    addFooter(slide, index, exportSlides.length, preset, pageSizeId);
  }

  const data = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const arrayBuffer = new ArrayBuffer(data.byteLength);

  new Uint8Array(arrayBuffer).set(data);

  return arrayBuffer;
}
