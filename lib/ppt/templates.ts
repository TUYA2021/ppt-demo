import type { PageSizeId, PageSizePreset, TemplateId, TemplatePreset } from "./types";

export const templatePresets: TemplatePreset[] = [
  {
    id: "warmMinimal",
    name: "暖色极简",
    description: "浅暖底色、木色强调，适合住宅方案汇报。",
    colors: {
      background: "#f6f0e7",
      surface: "#fffaf3",
      text: "#1f1a17",
      muted: "#786a5d",
      accent: "#b9855a",
      imageBg: "#eadcc9",
    },
    font: {
      title: "Microsoft YaHei",
      body: "Microsoft YaHei",
    },
    showPageNumber: true,
  },
  {
    id: "galleryWhite",
    name: "白色画廊",
    description: "大留白和细线框，适合突出平面图与效果图。",
    colors: {
      background: "#f7f7f5",
      surface: "#ffffff",
      text: "#18181b",
      muted: "#71717a",
      accent: "#0f766e",
      imageBg: "#eceff1",
    },
    font: {
      title: "Microsoft YaHei",
      body: "Microsoft YaHei",
    },
    showPageNumber: true,
  },
  {
    id: "darkStudio",
    name: "深色工作室",
    description: "深色背景和高对比图片，适合更提案感的展示。",
    colors: {
      background: "#111827",
      surface: "#1f2937",
      text: "#f8fafc",
      muted: "#cbd5e1",
      accent: "#93c5fd",
      imageBg: "#0f172a",
    },
    font: {
      title: "Microsoft YaHei",
      body: "Microsoft YaHei",
    },
    showPageNumber: true,
  },
];

export const pageSizePresets: PageSizePreset[] = [
  {
    id: "wide16x9",
    name: "默认 16:9",
    description: "适合屏幕演示和常规汇报。",
    width: 13.333,
    height: 7.5,
  },
  {
    id: "a3Landscape",
    name: "A3 横向",
    description: "适合打印横版图册和大幅平面展示。",
    width: 16.54,
    height: 11.69,
  },
  {
    id: "a3Portrait",
    name: "A3 竖向",
    description: "适合竖版方案册、长图和打印页。",
    width: 11.69,
    height: 16.54,
  },
];

export function getTemplatePreset(templateId: TemplateId) {
  return templatePresets.find((preset) => preset.id === templateId) ?? templatePresets[0];
}

export function getPageSizePreset(pageSizeId: PageSizeId) {
  return pageSizePresets.find((preset) => preset.id === pageSizeId) ?? pageSizePresets[0];
}

export const providerBlocks = [
  { label: "图片来源", value: "手动上传 / 外部接口返回 URL", status: "当前用假图" },
  { label: "平面图比例", value: "正方形图片，居中展示", status: "已支持" },
  { label: "效果图比例", value: "16:9 图片，大图展示", status: "已支持" },
];
