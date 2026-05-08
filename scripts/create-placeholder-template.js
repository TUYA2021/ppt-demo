/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();

pptx.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pptx.layout = "CUSTOM_WIDE";
pptx.author = "ppt-demo";
pptx.company = "ppt-demo";
pptx.subject = "AI Design Presentation Placeholder Template";
pptx.title = "AI Design Presentation Template";
pptx.theme = {
  headFontFace: "Microsoft YaHei",
  bodyFontFace: "Microsoft YaHei",
};

const slides = [
  { label: "01 / COVER", bg: "F5F1E8", accent: "0F766E", text: "17211F", image: true },
  { label: "02 / PROJECT", bg: "FFFFFF", accent: "B45309", text: "18181B" },
  { label: "03 / ANALYSIS", bg: "10201D", accent: "9FD3C7", text: "FFFFFF", dark: true },
  { label: "04 / CONCEPT", bg: "FBFBFB", accent: "2563EB", text: "111827", image: true },
  { label: "05 / RENDER", bg: "FFFFFF", accent: "0F766E", text: "111827", image: true },
  { label: "06 / MATERIAL", bg: "FFF7ED", accent: "C2410C", text: "1F2937", image: true },
  { label: "07 / SUMMARY", bg: "111827", accent: "93C5FD", text: "FFFFFF", dark: true },
];

function addFooter(slide, cfg, index) {
  slide.background = { color: cfg.bg };
  slide.addText(cfg.label, {
    x: 0.55,
    y: 0.35,
    w: 2.8,
    h: 0.24,
    fontFace: "Microsoft YaHei",
    fontSize: 8,
    bold: true,
    color: cfg.accent,
    margin: 0,
    fit: "shrink",
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 6.92,
    w: 12.2,
    h: 0,
    line: { color: cfg.dark ? "334155" : "D4D4D8", width: 0.7 },
  });
  slide.addText("{{note}}", {
    x: 0.55,
    y: 7.03,
    w: 11.4,
    h: 0.24,
    fontFace: "Microsoft YaHei",
    fontSize: 7.5,
    color: cfg.dark ? "CBD5E1" : "71717A",
    margin: 0,
    fit: "shrink",
  });
  slide.addText(String(index + 1).padStart(2, "0"), {
    x: 12.3,
    y: 7.02,
    w: 0.45,
    h: 0.22,
    fontFace: "Microsoft YaHei",
    fontSize: 8,
    color: cfg.dark ? "CBD5E1" : "71717A",
    align: "right",
    margin: 0,
  });
}

function addTitle(slide, cfg, options = {}) {
  const x = options.x ?? 0.72;
  const y = options.y ?? 0.95;
  const w = options.w ?? 6.15;

  slide.addText("{{title}}", {
    x,
    y,
    w,
    h: options.titleH ?? 0.88,
    fontFace: "Microsoft YaHei",
    fontSize: options.titleSize ?? 28,
    bold: true,
    color: cfg.text,
    margin: 0,
    fit: "shrink",
  });
  slide.addText("{{subtitle}}", {
    x: x + 0.02,
    y: y + (options.subtitleOffset ?? 1.0),
    w: w - 0.05,
    h: 0.42,
    fontFace: "Microsoft YaHei",
    fontSize: options.subtitleSize ?? 13,
    color: cfg.dark ? "CBD5E1" : "52525B",
    margin: 0,
    fit: "shrink",
  });
}

function addPoints(slide, cfg, options = {}) {
  slide.addText("{{points}}", {
    x: options.x ?? 0.78,
    y: options.y ?? 3.0,
    w: options.w ?? 5.7,
    h: options.h ?? 2.2,
    fontFace: "Microsoft YaHei",
    fontSize: options.fontSize ?? 14,
    color: cfg.text,
    margin: 0.08,
    fit: "shrink",
    breakLine: false,
    valign: "mid",
    paraSpaceAfterPt: 8,
  });
}

function addImagePlaceholder(slide, cfg, options = {}) {
  const x = options.x ?? 7.1;
  const y = options.y ?? 0.85;
  const w = options.w ?? 5.35;
  const h = options.h ?? 5.75;

  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: cfg.dark ? "1E293B" : "ECE7DC" },
    line: { color: cfg.accent, width: 1, transparency: 20 },
  });
  slide.addText("{{image_1}}", {
    x,
    y,
    w,
    h,
    fontFace: "Microsoft YaHei",
    fontSize: 15,
    bold: true,
    color: cfg.accent,
    align: "center",
    valign: "mid",
    margin: 0,
    fit: "shrink",
  });
}

slides.forEach((cfg, index) => {
  const slide = pptx.addSlide();

  addFooter(slide, cfg, index);

  if (index === 0) {
    slide.addText("AI DESIGN PRESENTATION", {
      x: 0.75,
      y: 0.58,
      w: 3.2,
      h: 0.25,
      fontFace: "Microsoft YaHei",
      fontSize: 8,
      bold: true,
      color: cfg.accent,
      margin: 0,
    });
    addTitle(slide, cfg, {
      x: 0.75,
      y: 1.45,
      w: 5.95,
      titleSize: 33,
      titleH: 1.2,
      subtitleOffset: 1.35,
      subtitleSize: 15,
    });
    addPoints(slide, cfg, { x: 0.8, y: 4.85, w: 5.4, h: 1.25, fontSize: 12 });
    addImagePlaceholder(slide, cfg, { x: 7.25, y: 0.62, w: 5.38, h: 5.95 });
    return;
  }

  if (index === 2) {
    addTitle(slide, cfg, { x: 0.75, y: 0.9, w: 4.55, titleSize: 26 });
    addPoints(slide, cfg, { x: 6.0, y: 1.2, w: 5.95, h: 4.55, fontSize: 16 });
    slide.addShape(pptx.ShapeType.line, {
      x: 5.5,
      y: 0.8,
      w: 0,
      h: 5.5,
      line: { color: cfg.accent, width: 1.4 },
    });
    return;
  }

  if (index === 4) {
    addImagePlaceholder(slide, cfg, { x: 0.65, y: 0.75, w: 7.0, h: 5.75 });
    addTitle(slide, cfg, { x: 8.1, y: 1.05, w: 4.15, titleSize: 25, titleH: 1.1 });
    addPoints(slide, cfg, { x: 8.15, y: 4.05, w: 3.9, h: 1.45, fontSize: 12 });
    return;
  }

  if (index === 6) {
    addTitle(slide, cfg, { x: 1.05, y: 1.05, w: 9.5, titleSize: 36, titleH: 1.05 });
    addPoints(slide, cfg, { x: 1.1, y: 3.8, w: 10.5, h: 1.8, fontSize: 17 });
    return;
  }

  addTitle(slide, cfg);
  addPoints(slide, cfg);

  if (cfg.image) {
    addImagePlaceholder(slide, cfg);
  } else {
    slide.addShape(pptx.ShapeType.rect, {
      x: 7.1,
      y: 1.15,
      w: 5.15,
      h: 4.7,
      fill: { color: cfg.dark ? "1E293B" : "F4F4F5", transparency: 8 },
      line: { color: cfg.dark ? "334155" : "E4E4E7", width: 1 },
    });
    addPoints(slide, cfg, { x: 7.45, y: 1.55, w: 4.45, h: 3.8, fontSize: 16 });
  }
});

const output = path.join(
  process.cwd(),
  "public",
  "templates",
  "ai-design-placeholder-template.pptx",
);

pptx.writeFile({ fileName: output }).then(() => {
  console.log(output);
});
