"use client";

import { useEffect, useMemo, useState } from "react";
import { TemplatePreview } from "@/components/ppt/TemplatePreview";
import { mockSlides } from "@/lib/ppt/mockData";
import {
  getPageSizePreset,
  getTemplatePreset,
  pageSizePresets,
  providerBlocks,
  templatePresets,
} from "@/lib/ppt/templates";
import type { PageSizeId, TemplateId } from "@/lib/ppt/types";

const monitorPpi27Inch2k = Math.sqrt(2560 ** 2 + 1440 ** 2) / 27;

export default function AutoPptPage() {
  const [slides] = useState(mockSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [templateId, setTemplateId] = useState<TemplateId>("warmMinimal");
  const [pageSizeId, setPageSizeId] = useState<PageSizeId>("wide16x9");
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [statusText, setStatusText] = useState(
    "当前是纯图片排版 Demo：先把平面图和效果图稳定放进 PPT。",
  );

  useEffect(() => {
    function updateDevicePixelRatio() {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    }

    updateDevicePixelRatio();
    window.addEventListener("resize", updateDevicePixelRatio);

    return () => window.removeEventListener("resize", updateDevicePixelRatio);
  }, []);

  const currentSlide = slides[currentIndex];
  const selectedPreset = useMemo(() => getTemplatePreset(templateId), [templateId]);
  const selectedPageSize = useMemo(() => getPageSizePreset(pageSizeId), [pageSizeId]);
  const aspectRatio = `${selectedPageSize.width} / ${selectedPageSize.height}`;
  const previewWidthPx = Math.round(
    (selectedPageSize.width * monitorPpi27Inch2k) / devicePixelRatio,
  );

  async function handleExportPpt() {
    setIsExporting(true);
    setStatusText("正在生成 PPT...");

    try {
      const response = await fetch("/api/ppt/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, templateId, pageSizeId }),
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
              先不接 AI，先把正方形平面图和 16:9 效果图排成干净的汇报 PPT。
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportPpt}
            disabled={isExporting}
            className="bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#27272a] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          >
            {isExporting ? "生成中..." : "导出 PPT"}
          </button>
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
            页面比例
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
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-178px)] grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="border-r border-[#dedfdc] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">页面</h2>
            <span className="text-xs text-[#71717a]">{slides.length} 页</span>
          </div>

          <div className="grid gap-2">
            {slides.map((slide, index) => {
              const selected = index === currentIndex;

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
              <span>
                第 {currentIndex + 1} 页 / {slides.length}
              </span>
            </div>
            <div className="mb-3 text-xs text-[#71717a]">
              1:1 实寸预览：按 27 寸 2K 屏幕估算，当前 {Math.round(monitorPpi27Inch2k)} PPI / DPR {devicePixelRatio.toFixed(2)}
            </div>

            <div
              className="w-full overflow-hidden border border-[#d4d4d8] bg-white shadow-sm"
              style={{ aspectRatio }}
            >
              <TemplatePreview
                slide={currentSlide}
                preset={selectedPreset}
                index={currentIndex}
                total={slides.length}
                pageSizeId={pageSizeId}
              />
            </div>
          </div>
        </section>

        <aside className="border-l border-[#dedfdc] bg-white p-5">
          <h2 className="text-sm font-semibold">当前版式</h2>
          <div className="mt-4 border border-[#e4e4e7] p-4">
            <div className="text-lg font-semibold">{currentSlide.layout}</div>
            <p className="mt-2 text-sm leading-6 text-[#71717a]">
              {currentSlide.layout === "planSquare"
                ? "适合室内平面图：正方形图片居中展示。"
                : currentSlide.layout === "renderWide"
                  ? "适合效果图：16:9 大图展示。"
                  : currentSlide.layout === "imageText"
                    ? "适合少量文字说明和材料图。"
                    : "适合封面或总结。"}
            </p>
          </div>

          <h2 className="mt-6 text-sm font-semibold">页面尺寸</h2>
          <div className="mt-3 border border-[#e4e4e7] p-3">
            <div className="text-sm font-medium">{selectedPageSize.name}</div>
            <div className="mt-1 text-xs text-[#71717a]">
              {selectedPageSize.width} × {selectedPageSize.height}
            </div>
            <div className="mt-1 text-xs text-[#71717a]">
              预览宽度 {previewWidthPx}px，按 27 寸 2K 屏幕做实寸换算
            </div>
          </div>

          <h2 className="mt-6 text-sm font-semibold">图片规则</h2>
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
                  {currentSlide.image ?? "暂无图片"}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#71717a]">要点</p>
                <div className="mt-1 min-h-20 border border-[#e4e4e7] p-3 text-[#52525b]">
                  {currentSlide.points?.join(" / ") ?? "无"}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
