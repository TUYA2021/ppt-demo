import path from "node:path";
import pptxgen from "pptxgenjs";
import { getPageSizePreset, getTemplatePreset } from "./templates";
import type { PageSizeId, SlideData, TemplateId, TemplatePreset } from "./types";

const baseWidth = 13.333;
const baseHeight = 7.5;

type Canvas = {
  width: number;
  height: number;
  sx: (value: number) => number;
  sy: (value: number) => number;
};

function publicImagePath(slide: SlideData) {
  const imagePath = slide.image ?? slide.images?.[0];

  if (!imagePath?.startsWith("/")) {
    return undefined;
  }

  return path.join(process.cwd(), "public", imagePath);
}

function createCanvas(width: number, height: number): Canvas {
  return {
    width,
    height,
    sx: (value) => (value / baseWidth) * width,
    sy: (value) => (value / baseHeight) * height,
  };
}

function scaledBox(
  canvas: Canvas,
  box: { x: number; y: number; w: number; h: number },
) {
  return {
    x: canvas.sx(box.x),
    y: canvas.sy(box.y),
    w: canvas.sx(box.w),
    h: canvas.sy(box.h),
  };
}

function addFooter(
  slide: pptxgen.Slide,
  index: number,
  total: number,
  preset: TemplatePreset,
  canvas: Canvas,
) {
  if (!preset.showPageNumber) {
    return;
  }

  slide.addText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: canvas.width - canvas.sx(1.55),
    y: canvas.height - canvas.sy(0.42),
    w: canvas.sx(0.95),
    h: canvas.sy(0.2),
    fontFace: preset.font.body,
    fontSize: 8,
    color: preset.colors.muted.replace("#", ""),
    align: "right",
    margin: 0,
  });
}

function addTitle(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  canvas: Canvas,
  options: { x: number; y: number; w: number; size?: number; h?: number },
) {
  const box = scaledBox(canvas, {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h ?? 0.7,
  });

  slide.addText(item.title, {
    ...box,
    fontFace: preset.font.title,
    fontSize: options.size ?? 26,
    bold: true,
    color: preset.colors.text.replace("#", ""),
    margin: 0,
    fit: "shrink",
  });

  if (item.subtitle) {
    const subtitleBox = scaledBox(canvas, {
      x: options.x + 0.02,
      y: options.y + (options.h ?? 0.7) + 0.18,
      w: options.w,
      h: 0.36,
    });

    slide.addText(item.subtitle, {
      ...subtitleBox,
      fontFace: preset.font.body,
      fontSize: 12,
      color: preset.colors.muted.replace("#", ""),
      margin: 0,
      fit: "shrink",
    });
  }
}

function addPoints(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  canvas: Canvas,
  options: { x: number; y: number; w: number; h: number; size?: number },
) {
  if (!item.points?.length) {
    return;
  }

  slide.addText(item.points.map((point) => `• ${point}`).join("\n"), {
    ...scaledBox(canvas, options),
    fontFace: preset.font.body,
    fontSize: options.size ?? 13,
    color: preset.colors.text.replace("#", ""),
    margin: 0.08,
    fit: "shrink",
    breakLine: false,
    valign: "middle",
  });
}

function addImage(
  slide: pptxgen.Slide,
  item: SlideData,
  canvas: Canvas,
  options: { x: number; y: number; w: number; h: number; contain?: boolean },
) {
  const imagePath = publicImagePath(item);
  const box = scaledBox(canvas, options);

  if (!imagePath) {
    return;
  }

  slide.addImage({
    path: imagePath,
    ...box,
    sizing: options.contain
      ? { type: "contain", ...box }
      : { type: "cover", ...box },
  });
}

function addCover(slide: pptxgen.Slide, item: SlideData, preset: TemplatePreset, canvas: Canvas) {
  slide.addText("Interior Presentation", {
    ...scaledBox(canvas, { x: 0.72, y: 0.58, w: 3, h: 0.25 }),
    fontFace: preset.font.body,
    fontSize: 8,
    bold: true,
    color: preset.colors.accent.replace("#", ""),
    margin: 0,
  });
  addTitle(slide, item, preset, canvas, { x: 0.72, y: 1.35, w: 5.55, h: 1.08, size: 32 });
  addPoints(slide, item, preset, canvas, { x: 0.78, y: 4.9, w: 5.25, h: 1.1, size: 12 });
  addImage(slide, item, canvas, { x: 7.1, y: 0.7, w: 5.45, h: 5.95 });
}

function addPlanSquare(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  canvas: Canvas,
) {
  slide.addShape("rect", {
    ...scaledBox(canvas, { x: 0.75, y: 0.78, w: 5.75, h: 5.75 }),
    fill: { color: preset.colors.imageBg.replace("#", "") },
    line: { color: preset.colors.imageBg.replace("#", "") },
  });
  addImage(slide, item, canvas, { x: 0.95, y: 0.98, w: 5.35, h: 5.35, contain: true });
  addTitle(slide, item, preset, canvas, { x: 7.15, y: 1.18, w: 4.75, h: 0.8, size: 28 });
  addPoints(slide, item, preset, canvas, { x: 7.2, y: 3.15, w: 4.7, h: 2.1, size: 13 });
}

function addRenderWide(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  canvas: Canvas,
) {
  slide.addShape("rect", {
    ...scaledBox(canvas, { x: 0.72, y: 0.65, w: 11.9, h: 5.35 }),
    fill: { color: preset.colors.imageBg.replace("#", "") },
    line: { color: preset.colors.imageBg.replace("#", "") },
  });
  addImage(slide, item, canvas, { x: 0.72, y: 0.65, w: 11.9, h: 5.35 });
  addTitle(slide, item, preset, canvas, { x: 0.72, y: 6.22, w: 8.3, h: 0.42, size: 22 });
}

function addImageText(
  slide: pptxgen.Slide,
  item: SlideData,
  preset: TemplatePreset,
  canvas: Canvas,
) {
  addTitle(slide, item, preset, canvas, { x: 0.72, y: 1.0, w: 5.3, h: 0.72, size: 27 });
  addPoints(slide, item, preset, canvas, { x: 0.78, y: 3.2, w: 5.15, h: 2.2, size: 13 });
  addImage(slide, item, canvas, { x: 6.85, y: 0.78, w: 5.75, h: 5.75 });
}

function addSummary(slide: pptxgen.Slide, item: SlideData, preset: TemplatePreset, canvas: Canvas) {
  slide.addText("Summary", {
    ...scaledBox(canvas, { x: 0.95, y: 0.92, w: 2, h: 0.25 }),
    fontFace: preset.font.body,
    fontSize: 8,
    bold: true,
    color: preset.colors.accent.replace("#", ""),
    margin: 0,
  });
  addTitle(slide, item, preset, canvas, { x: 0.95, y: 1.55, w: 9.7, h: 0.95, size: 34 });
  addPoints(slide, item, preset, canvas, { x: 1.0, y: 4.05, w: 9.5, h: 1.7, size: 16 });
}

export async function exportSlidesToPptx(
  slides: SlideData[],
  templateId: TemplateId = "warmMinimal",
  pageSizeId: PageSizeId = "wide16x9",
): Promise<ArrayBuffer> {
  const preset = getTemplatePreset(templateId);
  const pageSize = getPageSizePreset(pageSizeId);
  const canvas = createCanvas(pageSize.width, pageSize.height);
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

    slide.background = { color: preset.colors.background.replace("#", "") };

    if (item.layout === "cover") {
      addCover(slide, item, preset, canvas);
    } else if (item.layout === "planSquare") {
      addPlanSquare(slide, item, preset, canvas);
    } else if (item.layout === "renderWide") {
      addRenderWide(slide, item, preset, canvas);
    } else if (item.layout === "summary") {
      addSummary(slide, item, preset, canvas);
    } else {
      addImageText(slide, item, preset, canvas);
    }

    addFooter(slide, index, slides.length, preset, canvas);
  });

  const data = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  const arrayBuffer = new ArrayBuffer(data.byteLength);

  new Uint8Array(arrayBuffer).set(data);

  return arrayBuffer;
}
