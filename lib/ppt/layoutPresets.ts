import { getPageSizePreset } from "./templates";
import type { PageSizeId, SlideLayout } from "./types";

export type LayoutBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TextLayoutBox = LayoutBox & {
  fontSize: number;
  align?: "left" | "center" | "right";
};

export type ImageLayoutBox = LayoutBox & {
  fit: "cover" | "contain";
};

export type SlideLayoutPreset = {
  title: TextLayoutBox;
  subtitle?: TextLayoutBox;
  image?: ImageLayoutBox;
  singleImage?: ImageLayoutBox;
  imageSlots?: ImageLayoutBox[];
};

export type PageLayoutPreset = Record<SlideLayout, SlideLayoutPreset>;

const wide16x9Layouts: PageLayoutPreset = {
  cover: {
    title: { x: 0.9, y: 0.55, w: 11.53, h: 0.72, fontSize: 30, align: "center" },
    subtitle: { x: 1.25, y: 1.45, w: 10.83, h: 0.42, fontSize: 13, align: "center" },
    image: { x: 2.27, y: 2.18, w: 8.8, h: 4.95, fit: "cover" },
  },
  planSquare: {
    image: { x: 0.72, y: 0.65, w: 11.9, h: 5.35, fit: "contain" },
    title: { x: 0.72, y: 6.22, w: 11.9, h: 0.42, fontSize: 20, align: "center" },
  },
  renderWide: {
    image: { x: 0.72, y: 0.65, w: 11.9, h: 5.35, fit: "contain" },
    title: { x: 0.72, y: 6.22, w: 11.9, h: 0.42, fontSize: 20, align: "center" },
  },
  imageText: {
    title: { x: 0.72, y: 6.22, w: 11.9, h: 0.42, fontSize: 20, align: "center" },
    image: { x: 6.85, y: 0.78, w: 5.75, h: 5.75, fit: "contain" },
  },
  summary: {
    title: { x: 0.72, y: 6.08, w: 11.9, h: 0.55, fontSize: 24, align: "center" },
  },
};

const a3PortraitLayouts: PageLayoutPreset = {
  cover: {
    title: { x: 0.8, y: 1.25, w: 10.09, h: 1.8, fontSize: 28 },
    subtitle: { x: 0.8, y: 3.55, w: 10.09, h: 0.5, fontSize: 13 },
    image: { x: 0.4, y: 4.75, w: 10.89, h: 6.35, fit: "cover" },
  },
  planSquare: {
    image: { x: 0.75, y: 3.0, w: 10.19, h: 7.2, fit: "contain" },
    title: { x: 0.75, y: 14.25, w: 10.19, h: 0.65, fontSize: 24, align: "center" },
  },
  renderWide: {
    title: { x: 0.75, y: 14.25, w: 10.19, h: 0.65, fontSize: 24, align: "center" },
    singleImage: { x: 0.75, y: 1.35, w: 10.19, h: 12.45, fit: "contain" },
    imageSlots: [
      { x: 0.75, y: 1.75, w: 10.19, h: 5.73, fit: "contain" },
      { x: 0.75, y: 8.05, w: 10.19, h: 5.73, fit: "contain" },
    ],
  },
  imageText: {
    title: { x: 0.8, y: 14.25, w: 10.09, h: 0.65, fontSize: 24, align: "center" },
    image: { x: 0.8, y: 5.15, w: 10.09, h: 7.57, fit: "contain" },
  },
  summary: {
    title: { x: 0.8, y: 14.15, w: 10.09, h: 0.8, fontSize: 26, align: "center" },
  },
};

const a3LandscapeLayouts: PageLayoutPreset = {
  ...scalePageLayout(wide16x9Layouts, "a3Landscape"),
  cover: {
    title: { x: 1.25, y: 0.9, w: 14.04, h: 1.0, fontSize: 35, align: "center" },
    subtitle: { x: 1.6, y: 2.12, w: 13.34, h: 0.55, fontSize: 15, align: "center" },
    image: { x: 1.27, y: 3.1, w: 14.0, h: 7.88, fit: "cover" },
  },
};

function scalePageLayout(layouts: PageLayoutPreset, pageSizeId: PageSizeId): PageLayoutPreset {
  const source = getPageSizePreset("wide16x9");
  const target = getPageSizePreset(pageSizeId);
  const sx = target.width / source.width;
  const sy = target.height / source.height;

  return Object.fromEntries(
    Object.entries(layouts).map(([layout, preset]) => [
      layout,
      {
        title: scaleTextBox(preset.title, sx, sy),
        subtitle: preset.subtitle ? scaleTextBox(preset.subtitle, sx, sy) : undefined,
        image: preset.image ? scaleImageBox(preset.image, sx, sy) : undefined,
        singleImage: preset.singleImage ? scaleImageBox(preset.singleImage, sx, sy) : undefined,
        imageSlots: preset.imageSlots?.map((box) => scaleImageBox(box, sx, sy)),
      },
    ]),
  ) as PageLayoutPreset;
}

function scaleBox<T extends LayoutBox>(box: T, sx: number, sy: number): T {
  return {
    ...box,
    x: round(box.x * sx),
    y: round(box.y * sy),
    w: round(box.w * sx),
    h: round(box.h * sy),
  };
}

function scaleTextBox(box: TextLayoutBox, sx: number, sy: number): TextLayoutBox {
  return {
    ...scaleBox(box, sx, sy),
    fontSize: Math.round(box.fontSize * Math.min(sx, sy)),
  };
}

function scaleImageBox(box: ImageLayoutBox, sx: number, sy: number): ImageLayoutBox {
  return scaleBox(box, sx, sy);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export const layoutPresets: Record<PageSizeId, PageLayoutPreset> = {
  wide16x9: wide16x9Layouts,
  a3Landscape: a3LandscapeLayouts,
  a3Portrait: a3PortraitLayouts,
};

export function getSlideLayoutPreset(pageSizeId: PageSizeId, layout: SlideLayout) {
  return layoutPresets[pageSizeId]?.[layout] ?? layoutPresets.wide16x9[layout];
}
