import Image from "next/image";
import type { SlideData } from "@/lib/ppt/types";

export function CoverSlide({ slide }: { slide: SlideData }) {
  return (
    <section className="grid h-full grid-cols-[1fr_0.9fr] bg-[#f4f1e8] text-[#17211f]">
      <div className="flex flex-col justify-between p-12">
        <div>
          <p className="text-sm font-semibold uppercase text-[#0f766e]">AI Design Presentation</p>
          <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-tight">{slide.title}</h1>
          {slide.subtitle ? (
            <p className="mt-5 max-w-xl text-xl leading-8 text-[#52605c]">{slide.subtitle}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {slide.points?.map((point) => (
            <div key={point} className="border-t border-[#b7c8c2] pt-3 text-sm font-medium">
              {point}
            </div>
          ))}
        </div>
      </div>
      <div className="relative m-8 overflow-hidden bg-[#d9d2c3]">
        {slide.images?.[0] ? (
          <Image src={slide.images[0]} alt={slide.title} fill className="object-cover" priority />
        ) : null}
      </div>
    </section>
  );
}
