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
};

export type ImageLayoutBox = LayoutBox & {
  fit: "cover" | "contain";
};

export type SlideLayoutPreset = {
  title: TextLayoutBox;
  subtitle?: TextLayoutBox;
  image?: ImageLayoutBox;
};

export type PageLayoutPreset = Record<SlideLayout, SlideLayoutPreset>;

const wide16x9Layouts: PageLayoutPreset = {
  cover: {
    title: { x: 0.72, y: 1.15, w: 5.55, h: 1.08, fontSize: 30 },
    subtitle: { x: 0.74, y: 2.42, w: 5.5, h: 0.44, fontSize: 13 },
    image: { x: 7.1, y: 0.7, w: 5.45, h: 5.95, fit: "cover" },
  },
  planSquare: {
    image: { x: 0.95, y: 0.98, w: 5.35, h: 5.35, fit: "contain" },
    title: { x: 7.15, y: 1.18, w: 4.75, h: 0.8, fontSize: 26 },
  },
  renderWide: {
    image: { x: 0.72, y: 0.65, w: 11.9, h: 5.35, fit: "cover" },
    title: { x: 0.72, y: 6.22, w: 8.3, h: 0.42, fontSize: 20 },
  },
  imageText: {
    title: { x: 0.72, y: 1.0, w: 5.3, h: 0.72, fontSize: 25 },
    image: { x: 6.85, y: 0.78, w: 5.75, h: 5.75, fit: "cover" },
  },
  summary: {
    title: { x: 0.95, y: 1.55, w: 9.7, h: 0.95, fontSize: 32 },
  },
};

const a3PortraitLayouts: PageLayoutPreset = {
  cover: {
    title: { x: 0.8, y: 1.25, w: 10.09, h: 1.8, fontSize: 28 },
    subtitle: { x: 0.8, y: 3.55, w: 10.09, h: 0.5, fontSize: 13 },
    image: { x: 0.8, y: 5.0, w: 10.09, h: 5.68, fit: "cover" },
  },
  planSquare: {
    title: { x: 0.85, y: 1.25, w: 9.99, h: 1.0, fontSize: 26 },
    image: { x: 1.4, y: 4.3, w: 8.9, h: 8.9, fit: "contain" },
  },
  renderWide: {
    title: { x: 0.75, y: 1.35, w: 10.19, h: 0.9, fontSize: 26 },
    image: { x: 0.75, y: 4.2, w: 10.19, h: 5.73, fit: "cover" },
  },
  imageText: {
    title: { x: 0.8, y: 1.35, w: 10.09, h: 1.0, fontSize: 26 },
    image: { x: 0.8, y: 5.15, w: 10.09, h: 7.57, fit: "cover" },
  },
  summary: {
    title: { x: 0.95, y: 4.35, w: 9.79, h: 1.35, fontSize: 28 },
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
  a3Landscape: scalePageLayout(wide16x9Layouts, "a3Landscape"),
  a3Portrait: a3PortraitLayouts,
};

export function getSlideLayoutPreset(pageSizeId: PageSizeId, layout: SlideLayout) {
  return layoutPresets[pageSizeId]?.[layout] ?? layoutPresets.wide16x9[layout];
}
