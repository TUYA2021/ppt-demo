import Image from "next/image";
import type { SlideData } from "@/lib/ppt/types";

export function ConceptSlide({ slide }: { slide: SlideData }) {
  return (
    <section className="grid h-full grid-cols-[1fr_1fr] bg-[#fbfbfb] text-[#111827]">
      <div className="flex flex-col justify-center p-10">
        <p className="text-sm font-semibold text-[#2563eb]">Design Concept</p>
        <h2 className="mt-3 text-4xl font-semibold">{slide.title}</h2>
        {slide.subtitle ? <p className="mt-4 text-lg leading-8 text-[#4b5563]">{slide.subtitle}</p> : null}
        <div className="mt-8 grid gap-3">
          {slide.points?.map((point) => (
            <div key={point} className="bg-[#eaf1ff] px-5 py-4 text-base font-semibold text-[#1e3a8a]">
              {point}
            </div>
          ))}
        </div>
      </div>
      <div className="relative m-8 overflow-hidden bg-[#dbeafe]">
        {slide.images?.[0] ? <Image src={slide.images[0]} alt={slide.title} fill className="object-cover" /> : null}
      </div>
    </section>
  );
}
