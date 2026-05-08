"use client";

import type { SlideData } from "@/lib/ppt/types";

type SlideThumbnailListProps = {
  slides: SlideData[];
  selectedSlideId: string;
  onSelect: (slideId: string) => void;
};

export function SlideThumbnailList({
  slides,
  selectedSlideId,
  onSelect,
}: SlideThumbnailListProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-[#e4e4e7] bg-white">
      <div className="border-b border-[#e4e4e7] px-4 py-3 text-sm font-semibold text-[#3f3f46]">
        汇报页面
      </div>
      <div className="grid gap-3 p-3">
        {slides.map((slide, index) => {
          const selected = slide.id === selectedSlideId;

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSelect(slide.id)}
              className={`grid grid-cols-[40px_1fr] gap-3 border p-3 text-left transition ${
                selected
                  ? "border-[#0f766e] bg-[#ecfdf5]"
                  : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
              }`}
            >
              <span className="text-sm font-semibold text-[#71717a]">{index + 1}</span>
              <span>
                <span className="block text-sm font-semibold text-[#18181b]">{slide.title}</span>
                <span className="mt-1 block text-xs text-[#71717a]">{slide.type}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
