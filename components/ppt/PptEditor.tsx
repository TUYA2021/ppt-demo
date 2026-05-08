"use client";

import { useMemo, useState } from "react";
import type { SlideData } from "@/lib/ppt/types";
import { SlideCanvas } from "./SlideCanvas";
import { SlideThumbnailList } from "./SlideThumbnailList";

type PptEditorProps = {
  initialSlides: SlideData[];
};

type GeneratePptResponse = {
  slides: SlideData[];
};

export function PptEditor({ initialSlides }: PptEditorProps) {
  const [description, setDescription] = useState(
    "120 平三居，三口之家，希望客餐厅更开阔，增加玄关收纳，整体偏现代自然风。",
  );
  const [slides, setSlides] = useState(initialSlides);
  const [selectedSlideId, setSelectedSlideId] = useState(initialSlides[0]?.id ?? "");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const selectedSlide = useMemo(
    () => slides.find((slide) => slide.id === selectedSlideId) ?? slides[0],
    [slides, selectedSlideId],
  );

  function updateSlide(patch: Partial<SlideData>) {
    if (!selectedSlide) {
      return;
    }

    setSlides((currentSlides) =>
      currentSlides.map((slide) =>
        slide.id === selectedSlide.id ? { ...slide, ...patch } : slide,
      ),
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const response = await fetch("/api/ppt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = (await response.json()) as GeneratePptResponse;
      setSlides(data.slides);
      setSelectedSlideId(data.slides[0]?.id ?? "");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await fetch("/api/ppt/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-design-presentation.pptx";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (!selectedSlide) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f4f4f5] text-[#18181b]">
      <SlideThumbnailList
        slides={slides}
        selectedSlideId={selectedSlide.id}
        onSelect={setSelectedSlideId}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#e4e4e7] bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-xl font-semibold">AI 室内设计方案汇报生成器</h1>
              <p className="mt-1 text-sm text-[#71717a]">
                输入项目描述，生成 7 页设计汇报，编辑后导出 PPTX。
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
            >
              {exporting ? "导出中" : "导出 PPT"}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="resize-none border border-[#d4d4d8] bg-[#fafafa] px-3 py-2 text-sm leading-6 outline-none focus:border-[#0f766e]"
              placeholder="输入户型、面积、居住成员、风格偏好和功能需求"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="self-stretch bg-[#18181b] px-5 text-sm font-semibold text-white hover:bg-[#27272a] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
            >
              {generating ? "生成中" : "生成 PPT"}
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_360px]">
          <div className="flex min-w-0 items-center justify-center p-8">
            <div className="w-full max-w-5xl">
              <SlideCanvas slide={selectedSlide} />
            </div>
          </div>

          <aside className="border-l border-[#e4e4e7] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#3f3f46]">编辑当前页</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                标题
                <input
                  value={selectedSlide.title}
                  onChange={(event) => updateSlide({ title: event.target.value })}
                  className="border border-[#d4d4d8] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#0f766e]"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                副标题
                <input
                  value={selectedSlide.subtitle ?? ""}
                  onChange={(event) => updateSlide({ subtitle: event.target.value })}
                  className="border border-[#d4d4d8] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#0f766e]"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                要点
                <textarea
                  value={selectedSlide.points?.join("\n") ?? ""}
                  onChange={(event) =>
                    updateSlide({
                      points: event.target.value
                        .split("\n")
                        .map((point) => point.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={6}
                  className="resize-none border border-[#d4d4d8] px-3 py-2 text-sm leading-6 text-[#18181b] outline-none focus:border-[#0f766e]"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                图片路径
                <input
                  value={selectedSlide.images?.[0] ?? ""}
                  onChange={(event) =>
                    updateSlide({ images: event.target.value ? [event.target.value] : [] })
                  }
                  className="border border-[#d4d4d8] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#0f766e]"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#52525b]">
                备注
                <textarea
                  value={selectedSlide.note ?? ""}
                  onChange={(event) => updateSlide({ note: event.target.value })}
                  rows={5}
                  className="resize-none border border-[#d4d4d8] px-3 py-2 text-sm leading-6 text-[#18181b] outline-none focus:border-[#0f766e]"
                />
              </label>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
