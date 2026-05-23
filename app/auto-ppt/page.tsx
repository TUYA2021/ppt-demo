"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TemplatePreview } from "@/components/ppt/TemplatePreview";
import {
  buildSlidesFromProjectPayload,
  createProjectImageAsset,
  normalizeImageAsset,
} from "@/lib/ppt/buildSlides";
import { mockProjectPayload } from "@/lib/ppt/mockData";
import { getSlidesForPageSize } from "@/lib/ppt/slidesForPageSize";
import {
  getPageSizePreset,
  getTemplatePreset,
  pageSizePresets,
  providerBlocks,
  templatePresets,
} from "@/lib/ppt/templates";
import type {
  PageSizeId,
  ProjectImageAsset,
  ProjectImageCategory,
  ProjectPptPayload,
  TemplateId,
} from "@/lib/ppt/types";

type UploadResponse = {
  images: Array<{
    name: string;
    url: string;
  }>;
};

type ProjectImport = Partial<ProjectPptPayload["project"]> & {
  project?: Partial<ProjectPptPayload["project"]>;
  images?: ProjectImageAsset[];
};

const monitorPpi27Inch2k = Math.sqrt(2560 ** 2 + 1440 ** 2) / 27;
const categoryLabels: Record<ProjectImageCategory, string> = {
  cover: "封面",
  plan: "平面图",
  render: "效果图",
  material: "材料图",
  other: "其他",
};

const projectKeyMap: Record<string, keyof ProjectPptPayload["project"]> = {
  title: "title",
  projectTitle: "title",
  name: "title",
  intro: "intro",
  description: "intro",
  concept: "concept",
  coverImage: "coverImage",
  项目名称: "title",
  项目标题: "title",
  标题: "title",
  项目介绍: "intro",
  介绍: "intro",
  设计概念: "concept",
  概念: "concept",
  封面图: "coverImage",
  封面图片: "coverImage",
};

function slideImages(slide: { image?: string; images?: string[] }) {
  const images = slide.images ?? [];

  return slide.image ? [slide.image, ...images.filter((image) => image !== slide.image)] : images;
}

function parseProjectText(text: string) {
  const project: Partial<ProjectPptPayload["project"]> = {};
  const introLines: string[] = [];
  const plainLines: string[] = [];

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([^:：=]+)[:：=]\s*(.+)$/);

      if (!match) {
        plainLines.push(line);
        return;
      }

      const key = projectKeyMap[match[1].trim()];

      if (key === "intro") {
        introLines.push(match[2].trim());
      } else if (key) {
        project[key] = match[2].trim();
      }
    });

  if (!project.title && plainLines[0]) {
    project.title = plainLines[0];
  }

  if (!project.intro) {
    project.intro = [...introLines, ...plainLines.slice(project.title ? 1 : 0)].join("\n");
  }

  return project;
}

function parseProjectJson(text: string): {
  project: Partial<ProjectPptPayload["project"]>;
  images?: ProjectImageAsset[];
} {
  const parsed = JSON.parse(text) as ProjectImport;
  const projectSource = parsed.project ?? parsed;
  const project: Partial<ProjectPptPayload["project"]> = {};

  Object.entries(projectSource).forEach(([key, value]) => {
    const projectKey = projectKeyMap[key] ?? (key as keyof ProjectPptPayload["project"]);

    if (
      (projectKey === "title" ||
        projectKey === "intro" ||
        projectKey === "concept" ||
        projectKey === "coverImage") &&
      typeof value === "string"
    ) {
      project[projectKey] = value;
    }
  });

  return { project, images: parsed.images };
}

export default function AutoPptPage() {
  const projectInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<ProjectPptPayload>(mockProjectPayload);
  const [activePanel, setActivePanel] = useState<"project" | "images">("project");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [templateId, setTemplateId] = useState<TemplateId>("warmMinimal");
  const [pageSizeId, setPageSizeId] = useState<PageSizeId>("a3Landscape");
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState(
    "导入项目信息文件，再导入图片资产，系统会按规则自动生成 PPT。",
  );

  useEffect(() => {
    function updateDevicePixelRatio() {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    }

    updateDevicePixelRatio();
    window.addEventListener("resize", updateDevicePixelRatio);

    return () => window.removeEventListener("resize", updateDevicePixelRatio);
  }, []);

  const selectedPreset = useMemo(() => getTemplatePreset(templateId), [templateId]);
  const selectedPageSize = useMemo(() => getPageSizePreset(pageSizeId), [pageSizeId]);
  const slides = useMemo(() => buildSlidesFromProjectPayload(payload), [payload]);
  const previewSlides = useMemo(() => getSlidesForPageSize(slides, pageSizeId), [slides, pageSizeId]);
  const currentPreviewIndex = Math.min(currentIndex, previewSlides.length - 1);
  const currentSlide = previewSlides[currentPreviewIndex];
  const aspectRatio = `${selectedPageSize.width} / ${selectedPageSize.height}`;
  const previewWidthPx = Math.round(
    (selectedPageSize.width * monitorPpi27Inch2k) / devicePixelRatio,
  );

  function updateProject(project: Partial<ProjectPptPayload["project"]>) {
    setPayload((current) => ({ ...current, project: { ...current.project, ...project } }));
    setCurrentIndex(0);
  }

  function updateImage(imageId: string, patch: Partial<ProjectImageAsset>) {
    setPayload((current) => ({
      ...current,
      images: current.images.map((image) =>
        image.id === imageId ? { ...image, ...patch } : image,
      ),
    }));
  }

  function removeImage(imageId: string) {
    setPayload((current) => ({
      ...current,
      images: current.images.filter((image) => image.id !== imageId),
    }));
  }

  function goToPreviousSlide() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function goToNextSlide() {
    setCurrentIndex((index) => Math.min(index + 1, previewSlides.length - 1));
  }

  async function handleImportProjectInfo(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const imported =
        file.name.toLocaleLowerCase().endsWith(".json")
          ? parseProjectJson(text)
          : { project: parseProjectText(text) };

      setPayload((current) => ({
        ...current,
        project: {
          ...current.project,
          ...imported.project,
        },
        images: imported.images?.length
          ? imported.images.map((image, index) => normalizeImageAsset(image, index))
          : current.images,
      }));
      setActivePanel("project");
      setCurrentIndex(0);
      setStatusText(`已导入项目信息：${file.name}`);
    } catch {
      setStatusText("项目信息导入失败，请使用模板中的 JSON 或 TXT 格式。");
    } finally {
      if (projectInputRef.current) {
        projectInputRef.current.value = "";
      }
    }
  }

  async function handleUploadImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsUploading(true);
    setStatusText("正在导入图片资产...");

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => formData.append("images", file));

      const response = await fetch("/api/ppt/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = (await response.json()) as UploadResponse;
      const uploadedImages = data.images.map((image, index) =>
        createProjectImageAsset(image, index),
      );

      setPayload((current) => ({
        ...current,
        project: {
          ...current.project,
          coverImage: uploadedImages.find((image) => image.category === "cover")?.url,
        },
        images: uploadedImages,
      }));
      setActivePanel("images");
      setCurrentIndex(0);
      setStatusText(`已导入 ${uploadedImages.length} 张图片，并按命名规则自动归类。`);
    } catch {
      setStatusText("图片导入失败，请确认图片格式为 JPG、PNG 或 WebP。");
    } finally {
      setIsUploading(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }

  async function handleExportPpt() {
    setIsExporting(true);
    setStatusText("正在生成 PPT...");

    try {
      const response = await fetch("/api/ppt/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, templateId, pageSizeId }),
      });

      if (!response.ok) {
        throw new Error("PPT export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "interior-design-presentation.pptx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatusText("PPT 已生成并下载。");
    } catch {
      setStatusText("生成失败，请稍后重试。");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f4f2] text-[#18181b]">
      <header className="border-b border-[#dedfdc] bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-[#0f766e]">
              Interior Presentation Builder
            </p>
            <h1 className="mt-1 text-2xl font-semibold">室内方案汇报 PPT 生成器</h1>
            <p className="mt-1 text-sm text-[#71717a]">
              导入项目资料和图片资产，系统按命名规则自动编排页面。
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => projectInputRef.current?.click()}
              className="border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-semibold hover:border-[#111827]"
            >
              导入项目信息
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading}
              className="border border-[#111827] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f4f4f5] disabled:cursor-not-allowed disabled:border-[#d4d4d8] disabled:text-[#a1a1aa]"
            >
              {isUploading ? "导入中..." : "导入图片资产"}
            </button>
            <button
              type="button"
              onClick={handleExportPpt}
              disabled={isExporting}
              className="bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#27272a] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
            >
              {isExporting ? "生成中..." : "导出 PPT"}
            </button>
            <input
              ref={projectInputRef}
              type="file"
              accept=".json,.txt,application/json,text/plain"
              className="hidden"
              onChange={(event) => handleImportProjectInfo(event.target.files)}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(event) => handleUploadImages(event.target.files)}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[260px_240px_1fr] items-center gap-4 border border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
          <label className="grid gap-1 text-xs font-medium text-[#52525b]">
            选择模板风格
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value as TemplateId)}
              className="border border-[#d4d4d8] bg-white px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#111827]"
            >
              {templatePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-medium text-[#52525b]">
            页面尺寸
            <select
              value={pageSizeId}
              onChange={(event) => setPageSizeId(event.target.value as PageSizeId)}
              className="border border-[#d4d4d8] bg-white px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#111827]"
            >
              {pageSizePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{selectedPreset.name}</span>
              <span className="text-sm text-[#71717a]">/ {selectedPageSize.name}</span>
              <div className="flex gap-1">
                {Object.values(selectedPreset.colors)
                  .slice(0, 4)
                  .map((color) => (
                    <span
                      key={color}
                      className="h-4 w-7 border border-black/10"
                      style={{ background: color }}
                    />
                  ))}
              </div>
            </div>
            <div className="mt-1 text-xs text-[#71717a]">
              {selectedPreset.description} {selectedPageSize.description}
            </div>
            <div className="mt-1 text-xs text-[#71717a]">{statusText}</div>
            <div className="mt-2 flex gap-3 text-xs text-[#0f766e]">
              <a href="/import-templates/project-info-template.json" download>
                项目信息 JSON 模板
              </a>
              <a href="/import-templates/project-info-template.txt" download>
                项目信息 TXT 模板
              </a>
              <a href="/import-templates/project-info-schema.json" download>
                字段说明
              </a>
              <a href="/import-templates/image-naming-rules.txt" download>
                图片命名规则
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-178px)] grid-cols-[260px_minmax(0,1fr)_360px]">
        <aside className="border-r border-[#dedfdc] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">页面</h2>
            <span className="text-xs text-[#71717a]">{previewSlides.length} 页</span>
          </div>

          <div className="grid gap-2">
            {previewSlides.map((slide, index) => {
              const selected = index === currentPreviewIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`grid grid-cols-[34px_1fr] gap-3 border p-3 text-left transition ${
                    selected
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                  }`}
                >
                  <span className={selected ? "text-white/70" : "text-[#71717a]"}>
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{slide.title}</span>
                    <span
                      className={
                        selected
                          ? "mt-1 block text-xs text-white/60"
                          : "mt-1 block text-xs text-[#71717a]"
                      }
                    >
                      {slide.layout}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 items-center justify-center overflow-auto p-8">
          <div className="flex-none" style={{ width: previewWidthPx }}>
            <div className="mb-3 flex items-center justify-between text-sm text-[#71717a]">
              <span>
                当前模板：{selectedPreset.name} / {selectedPageSize.name}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goToPreviousSlide}
                  disabled={currentPreviewIndex === 0}
                  aria-label="上一页"
                  title="上一页"
                  className="grid h-8 w-10 place-items-center border border-[#d4d4d8] bg-white text-lg text-[#18181b] transition hover:border-[#111827] hover:bg-[#f4f4f5] disabled:cursor-not-allowed disabled:border-[#e4e4e7] disabled:text-[#c4c4c7]"
                >
                  ←
                </button>
                <span>
                  第 {currentPreviewIndex + 1} 页 / {previewSlides.length}
                </span>
                <button
                  type="button"
                  onClick={goToNextSlide}
                  disabled={currentPreviewIndex >= previewSlides.length - 1}
                  aria-label="下一页"
                  title="下一页"
                  className="grid h-8 w-10 place-items-center border border-[#d4d4d8] bg-white text-lg text-[#18181b] transition hover:border-[#111827] hover:bg-[#f4f4f5] disabled:cursor-not-allowed disabled:border-[#e4e4e7] disabled:text-[#c4c4c7]"
                >
                  →
                </button>
              </div>
            </div>
            <div className="mb-3 text-xs text-[#71717a]">
              1:1 实寸预览：按 27 寸 2K 屏幕估算，当前 {Math.round(monitorPpi27Inch2k)} PPI / DPR{" "}
              {devicePixelRatio.toFixed(2)}
            </div>

            <div
              className="w-full overflow-hidden border border-[#d4d4d8] bg-white shadow-sm"
              style={{ aspectRatio }}
            >
              <TemplatePreview
                slide={currentSlide}
                preset={selectedPreset}
                index={currentPreviewIndex}
                total={previewSlides.length}
                pageSizeId={pageSizeId}
              />
            </div>
          </div>
        </section>

        <aside className="border-l border-[#dedfdc] bg-white p-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActivePanel("project")}
              className={`border px-3 py-2 text-sm font-semibold ${
                activePanel === "project"
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-[#d4d4d8] bg-white"
              }`}
            >
              项目信息
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("images")}
              className={`border px-3 py-2 text-sm font-semibold ${
                activePanel === "images"
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-[#d4d4d8] bg-white"
              }`}
            >
              图片资产
            </button>
          </div>

          {activePanel === "project" ? (
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                首页标题
                <input
                  value={payload.project.title}
                  onChange={(event) => updateProject({ title: event.target.value })}
                  className="border border-[#d4d4d8] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#111827]"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                设计概念
                <input
                  value={payload.project.concept ?? ""}
                  onChange={(event) => updateProject({ concept: event.target.value })}
                  className="border border-[#d4d4d8] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#111827]"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                项目介绍
                <textarea
                  value={payload.project.intro}
                  onChange={(event) => updateProject({ intro: event.target.value })}
                  rows={5}
                  className="resize-none border border-[#d4d4d8] px-3 py-2 text-sm leading-6 text-[#18181b] outline-none focus:border-[#111827]"
                />
              </label>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="border border-[#111827] px-3 py-2 text-sm font-semibold hover:bg-[#f4f4f5] disabled:cursor-not-allowed disabled:border-[#d4d4d8]"
              >
                {isUploading ? "导入中..." : "继续导入图片资产"}
              </button>

              {payload.images.map((image) => (
                <div key={image.id} className="border border-[#e4e4e7] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{image.name}</div>
                      <div className="mt-1 break-all text-xs text-[#71717a]">{image.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="border border-[#d4d4d8] px-2 py-1 text-xs text-[#71717a] hover:border-[#111827] hover:text-[#111827]"
                    >
                      删除
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_1fr] gap-2">
                    <label className="grid gap-1 text-xs font-medium text-[#52525b]">
                      类型
                      <select
                        value={image.category}
                        onChange={(event) =>
                          updateImage(image.id, {
                            category: event.target.value as ProjectImageCategory,
                          })
                        }
                        className="border border-[#d4d4d8] bg-white px-2 py-2 text-sm text-[#18181b] outline-none"
                      >
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs font-medium text-[#52525b]">
                      空间
                      <input
                        value={image.room ?? ""}
                        onChange={(event) => updateImage(image.id, { room: event.target.value })}
                        className="border border-[#d4d4d8] px-2 py-2 text-sm text-[#18181b] outline-none"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-6 text-sm font-semibold">生成规则</h2>
          <div className="mt-3 grid gap-3">
            {providerBlocks.map((block) => (
              <div key={block.label} className="border border-[#e4e4e7] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#71717a]">{block.label}</span>
                  <span className="bg-[#f4f4f5] px-2 py-1 text-xs text-[#52525b]">
                    {block.status}
                  </span>
                </div>
                <div className="mt-2 text-sm font-medium">{block.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#e4e4e7] pt-5">
            <h3 className="text-sm font-semibold">当前页数据</h3>
            <div className="mt-3 grid gap-3 text-sm">
              <div>
                <p className="text-xs text-[#71717a]">标题</p>
                <div className="mt-1 border border-[#e4e4e7] p-3">{currentSlide.title}</div>
              </div>
              <div>
                <p className="text-xs text-[#71717a]">图片</p>
                <div className="mt-1 border border-[#e4e4e7] p-3 text-[#52525b]">
                  {slideImages(currentSlide).join(" / ") || "暂无图片"}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
