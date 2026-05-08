import Image from "next/image";
import type { SlideData } from "@/lib/ppt/types";

export function RenderSlide({ slide }: { slide: SlideData }) {
  return (
    <section className="flex h-full flex-col bg-white p-10 text-[#111827]">
      <div className="flex items-start justify-between gap-8">
        <div>
          <p className="text-sm font-semibold text-[#0f766e]">Optimization Strategy</p>
          <h2 className="mt-3 text-4xl font-semibold">{slide.title}</h2>
          {slide.subtitle ? <p className="mt-4 max-w-2xl text-lg leading-8 text-[#4b5563]">{slide.subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-7 grid flex-1 grid-cols-[1fr_1.2fr] gap-6">
        <div className="grid content-start gap-3">
          {slide.points?.map((point) => (
            <div key={point} className="border-l-4 border-[#0f766e] bg-[#ecfdf5] p-4 font-medium">
              {point}
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden bg-[#e5e7eb]">
          {slide.images?.[0] ? <Image src={slide.images[0]} alt={slide.title} fill className="object-cover" /> : null}
        </div>
      </div>
    </section>
  );
}
